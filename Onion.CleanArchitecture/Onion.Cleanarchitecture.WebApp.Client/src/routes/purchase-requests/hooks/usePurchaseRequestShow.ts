import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useShow, useCustomMutation, useApiUrl, useOne, useMany, useGetIdentity,
} from "@refinedev/core";
import { App } from "antd";
import { PurchaseRequestStatus } from "../constants/enums";
import type {
  ILocalPurchaseRequest, ILocalCategory, ILocalItem,
  IPurchaseRequestApprover, IPurchaseRequestApproval,
} from "../types";

export interface VisibleAction {
  label: string;
  endpoint: string;
  color: string;
  danger?: boolean;
}

export interface UsePurchaseRequestShowReturn {
  record: ILocalPurchaseRequest | undefined;
  status: PurchaseRequestStatus | undefined;
  isLoading: boolean;
  refetch: () => void;
  isMutating: boolean;
  deptName: string | undefined;
  creatorName: string;
  categories: ILocalCategory[];
  approvers: IPurchaseRequestApprover[];
  approvals: IPurchaseRequestApproval[];
  currentApprover: IPurchaseRequestApprover | null;
  visibleActions: VisibleAction[];
  showEdit: boolean;
  isCreator: boolean;
  modalVisible: boolean;
  confirmModalVisible: boolean;
  actionEndpoint: string;
  actionLabel: string;
  actionNote: string;
  showAllHistory: boolean;
  localQty: Record<number, number>;
  setModalVisible: (v: boolean) => void;
  setConfirmModalVisible: (v: boolean) => void;
  setActionEndpoint: (v: string) => void;
  setActionLabel: (v: string) => void;
  setActionNote: (v: string) => void;
  setShowAllHistory: (v: boolean) => void;
  setLocalQty: (qty: Record<number, number>) => void;
  handleBulkConfirm: () => void;
  executeTrigger: () => void;
}

export function usePurchaseRequestShow(): UsePurchaseRequestShowReturn {
  const { queryResult: { isLoading, data, refetch } } = useShow<ILocalPurchaseRequest>();
  const { mutate, isLoading: isMutating } = useCustomMutation();
  const apiUrl = useApiUrl();
  const { message } = App.useApp();
  const { data: identity } = useGetIdentity<{ Uid: string }>();

  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionEndpoint, setActionEndpoint] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [localQty, setLocalQty] = useState<Record<number, number>>({});

  const record = data?.data;
  const status = record?.Status as PurchaseRequestStatus | undefined;

  const userId = identity?.Uid;
  const isCreator = !!(userId && record?.CreatedBy && String(userId) === String(record.CreatedBy));
  const showEdit = !!isCreator && (status === PurchaseRequestStatus.Draft || status === PurchaseRequestStatus.ReturnedForEdit);

  const { data: deptData } = useOne({
    resource: "departments",
    id: record?.DepartmentId ?? "",
    queryOptions: { enabled: !!record?.DepartmentId },
  });
  const { data: creatorData } = useMany({
    resource: "users",
    ids: record?.CreatedBy ? [record.CreatedBy] : [],
    queryOptions: { enabled: !!record?.CreatedBy },
  });

  const categories = useMemo(() => record?.RequestCategories ?? [], [record]);
  const approvers = useMemo(() => record?.Approvers ?? [], [record]);
  const approvals = useMemo(() => record?.Approvals ?? [], [record]);

  useEffect(() => {
    const initialQty: Record<number, number> = {};
    categories.forEach((cat) => {
      (cat.RequestItems ?? []).forEach((item) => {
        initialQty[item.Id] = item.ActualQuantity > 0
          ? item.ActualQuantity
          : item.ProposedQuantity;
      });
    });
    setLocalQty(initialQty);
  }, [categories]);

  const creatorUser = useMemo(() => {
    const users = (creatorData?.data ?? []) as Record<string, unknown>[];
    return users.find((u) => u.Id === record?.CreatedBy || u.id === record?.CreatedBy);
  }, [creatorData, record?.CreatedBy]);

  const creatorName = (creatorUser?.UserName ?? creatorUser?.Name ?? record?.CreatedBy) as string;

  const currentApprover = useMemo(() => {
    if (!identity?.Uid || !approvers.length) return null;
    return approvers.find(
      (ap) => String(ap.ApproverId) === String(identity.Uid)
    ) ?? null;
  }, [identity, approvers]);

  const visibleActions = useMemo(() => {
    if (status == null) return [];
    const s = status;
    const canAct = !!(currentApprover && (currentApprover.Status === 0 || currentApprover.Status === 1));
    const isStep1 = currentApprover?.StepOrder === 1;
    const isStep2 = currentApprover?.StepOrder === 2;

    const roleMap: Record<string, boolean> = {
      submit: !!isCreator && (s === PurchaseRequestStatus.Draft || s === PurchaseRequestStatus.ReturnedForEdit),
      "approve-department": !!canAct && isStep1 && s === PurchaseRequestStatus.PendingDepartment,
      reject: (!!canAct && isStep1 && s === PurchaseRequestStatus.PendingDepartment) || (!!canAct && isStep2 && s === PurchaseRequestStatus.PendingControl),
      approve: !!canAct && isStep2 && s === PurchaseRequestStatus.PendingControl,
      "return-for-edit": !!canAct && isStep2 && s === PurchaseRequestStatus.PendingControl,
      "confirm-order": !!isCreator && s === PurchaseRequestStatus.PendingOrderConfirm,
    };

    return Object.entries(roleMap)
      .filter(([_, visible]) => visible)
      .map(([endpoint]) => ({
        endpoint,
        label: endpoint === "submit" ? "Gửi duyệt"
          : endpoint === "approve-department" ? "Duyệt"
          : endpoint === "approve" ? "Phê duyệt"
          : endpoint === "reject" ? "Từ chối"
          : endpoint === "return-for-edit" ? "Trả về chỉnh sửa"
          : "Hoàn tất đơn hàng",
        color: endpoint === "submit" ? "geekblue"
          : endpoint === "reject" ? "error"
          : endpoint === "return-for-edit" ? "warning"
          : endpoint === "confirm-order" ? "purple"
          : "success",
        danger: endpoint === "reject",
      }));
  }, [status, isCreator, currentApprover]);

  const sortedApprovers = useMemo(
    () => [...approvers].sort((a, b) => a.StepOrder - b.StepOrder),
    [approvers]
  );

  const getApprovalAction = useCallback(
    (approverId: string) =>
      approvals.find((ap) => String(ap.ApproverId) === String(approverId)),
    [approvals]
  );

  const handleBulkConfirm = useCallback(() => {
    const items = categories
      .flatMap((cat) => cat.RequestItems ?? [])
      .filter((item) => {
        const qty = localQty[item.Id];
        return qty !== undefined && qty !== item.ActualQuantity;
      })
      .map((item) => ({
        id: item.Id,
        actualQuantity: localQty[item.Id] ?? item.ProposedQuantity,
      }));

    if (items.length === 0) {
      message.warning("Không có thay đổi số lượng nào!");
      return;
    }

    mutate(
      {
        url: `${apiUrl}/purchase-request-items/${record!.Id}/update-true-quantity-items`,
        method: "put",
        values: { purchaseRequestId: record!.Id, actualQuantityItems: items },
      },
      {
        onSuccess: () => {
          mutate(
            {
              url: `${apiUrl}/purchase-requests/${record!.Id}/trigger`,
              method: "post",
              values: { id: record!.Id, action: "confirm", note: actionNote },
            },
            {
              onSuccess: () => {
                message.success("Hoàn tất đơn hàng thành công!");
                setConfirmModalVisible(false);
                setActionNote("");
                refetch();
              },
            }
          );
        },
      }
    );
  }, [categories, localQty, record, actionNote, apiUrl, mutate, message, refetch]);

  const executeTrigger = useCallback(() => {
    const actionMap: Record<string, string> = {
      "return-for-edit": "return",
      "approve-department": "approve",
      "confirm-order": "confirm",
    };
    const finalAction = actionMap[actionEndpoint] ?? actionEndpoint;

    mutate(
      {
        url: `${apiUrl}/purchase-requests/${record!.Id}/trigger`,
        method: "post",
        values: { id: record!.Id, action: finalAction, note: actionNote },
      },
      {
        onSuccess: () => {
          message.success("Thành công!");
          setModalVisible(false);
          refetch();
        },
      }
    );
  }, [actionEndpoint, actionNote, record, apiUrl, mutate, message, refetch]);

  return {
    record,
    status,
    isLoading,
    refetch,
    isMutating,
    deptName: deptData?.data?.Name as string | undefined,
    creatorName,
    categories,
    approvers: sortedApprovers,
    approvals,
    currentApprover,
    visibleActions,
    showEdit,
    isCreator,
    modalVisible,
    confirmModalVisible,
    actionEndpoint,
    actionLabel,
    actionNote,
    showAllHistory,
    localQty,
    setModalVisible,
    setConfirmModalVisible,
    setActionEndpoint,
    setActionLabel,
    setActionNote,
    setShowAllHistory,
    setLocalQty,
    handleBulkConfirm,
    executeTrigger,
  };
}
