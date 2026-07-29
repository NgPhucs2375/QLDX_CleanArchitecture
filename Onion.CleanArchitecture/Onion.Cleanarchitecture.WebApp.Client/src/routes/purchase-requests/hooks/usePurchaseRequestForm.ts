import { useState, useRef, useCallback, useMemo } from "react";
import { useForm } from "@refinedev/antd";
import { useCreate, useUpdate, useNavigation, HttpError } from "@refinedev/core";
import { Form, App } from "antd";
import { dataProvider } from "../../providers/data-provider";
import type {
  IPurchaseRequest, ICascadeCreateData, ICascadeProduct,
  ICreatePayload, ISelectedCategory, IFormItem,
} from "../types";

let rowIdCounter = 0;
const generateRowId = () => `r_${Date.now()}_${++rowIdCounter}`;

export interface UsePurchaseRequestFormReturn {
  form: ReturnType<typeof useForm>;
  selectedCategories: ISelectedCategory[];
  selectedApproverId: string;
  loadingCascade: boolean;
  cascadeData: ICascadeCreateData;
  productsCache: Record<number, ICascadeProduct[]>;
  totalProposed: number;
  totalItems: number;
  setSelectedApproverId: (id: string) => void;
  setSelectedCategories: (cats: ISelectedCategory[]) => void;
  handleConfigChange: (cascade: { loadCascade: (configId: number, deptId: number) => Promise<void> }) => Promise<void>;
  addCategory: (catId: number, loadFn: (catId: number) => Promise<ICascadeProduct[]>) => Promise<void>;
  removeCategory: (catId: number) => void;
  addItem: (categoryId: number) => void;
  removeItem: (categoryId: number, rowId: string) => void;
  updateItemField: (categoryId: number, rowId: string, field: keyof IFormItem, val: string | number | null) => void;
  handleSubmit: (onSuccess?: () => void) => Promise<void>;
  initEditData: (initialData: any, cascadeLoadFn: (configId: number, deptId: number) => Promise<void>, productLoadFn: (catId: number) => Promise<ICascadeProduct[]>) => void;
  setCascadeData: (data: ICascadeCreateData) => void;
}

export function usePurchaseRequestForm(mode: "create" | "edit"): UsePurchaseRequestFormReturn {
  const form = useForm<IPurchaseRequest, HttpError>({
    redirect: mode === "create" ? "list" : "show",
  });
  const { mutate: createMutate, isLoading: isCreating } = useCreate<IPurchaseRequest, HttpError, ICreatePayload>();
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdate<IPurchaseRequest, HttpError, any>();
  const { message } = App.useApp();
  const { list } = useNavigation();

  const [cascadeData, setCascadeData] = useState<ICascadeCreateData>({
    categories: [], approvers: [], departmentHeads: [], departmentManagerId: "",
  });
  const [selectedApproverId, setSelectedApproverId] = useState<string>("");
  const [loadingCascade, setLoadingCascade] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ISelectedCategory[]>([]);
  const [productsCache, setProductsCache] = useState<Record<number, ICascadeProduct[]>>({});
  const selectedRef = useRef(selectedCategories);
  const hasInitRef = useRef(false);

  const formInstance = form.formProps.form;
  const selectedDepartmentId = Form.useWatch("DepartmentId", formInstance);

  useMemo(() => {
    selectedRef.current = selectedCategories;
  }, [selectedCategories]);

  const handleConfigChange = useCallback(async (cascade: { loadCascade: (configId: number, deptId: number) => Promise<void> }) => {
    const configId = formInstance?.getFieldValue("ProposalConfigId");
    const deptId = formInstance?.getFieldValue("DepartmentId");
    if (!configId || !deptId) return;

    setLoadingCascade(true);
    setSelectedCategories([]);
    try {
      await cascade.loadCascade(configId, deptId);
    } finally {
      setLoadingCascade(false);
    }
  }, [formInstance]);

  const addCategory = useCallback(async (
    catId: number,
    loadFn: (catId: number) => Promise<ICascadeProduct[]>,
  ) => {
    const cat = cascadeData.categories.find((c) => c.categoryId === catId);
    if (!cat || selectedRef.current.some((s) => s.categoryId === catId)) return;

    setSelectedCategories((prev) => [
      ...prev,
      {
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        allowedQuota: cat.allowedQuota,
        items: [],
      },
    ]);
    await loadFn(catId);
  }, [cascadeData.categories]);

  const removeCategory = useCallback((catId: number) => {
    setSelectedCategories((prev) => prev.filter((c) => c.categoryId !== catId));
  }, []);

  const addItem = useCallback((categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.map((c) =>
        c.categoryId !== categoryId
          ? c
          : {
              ...c,
              items: [
                ...c.items,
                {
                  productId: 0,
                  productName: "",
                  unitPrice: 0,
                  unit: "",
                  proposedQuantity: 1,
                  note: "",
                  rowId: generateRowId(),
                },
              ],
            }
      )
    );
  }, []);

  const removeItem = useCallback((categoryId: number, rowId: string) => {
    setSelectedCategories((prev) =>
      prev.map((c) =>
        c.categoryId !== categoryId
          ? c
          : { ...c, items: c.items.filter((i) => i.rowId !== rowId) }
      )
    );
  }, []);

  const updateItemField = useCallback(
    (categoryId: number, rowId: string, field: keyof IFormItem, val: string | number | null) => {
      setSelectedCategories((prev) =>
        prev.map((c) =>
          c.categoryId !== categoryId
            ? c
            : {
                ...c,
                items: c.items.map((i) =>
                  i.rowId === rowId ? { ...i, [field]: val } : i
                ),
              }
        )
      );
    },
    []
  );

  const preparePayload = useCallback((values: any): ICreatePayload | null => {
    const validCategories = selectedCategories.filter((c) => c.items.length > 0);
    if (validCategories.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 danh mục có sản phẩm!");
      return null;
    }
    const overQuota = validCategories.filter(
      (c) =>
        c.items.reduce((s, i) => s + i.unitPrice * i.proposedQuantity, 0) >
        c.allowedQuota
    );
    if (overQuota.length > 0) {
      message.error(
        `Các danh mục vượt định mức: ${overQuota.map((c) => c.categoryName).join(", ")}`
      );
      return null;
    }
    return {
      Code: values.Code,
      DepartmentId: values.DepartmentId,
      ProposalConfigId: values.ProposalConfigId,
      ApproverId: selectedApproverId,
      Reason: values.Reason,
      ContactName: values.ContactName,
      ContactPhone: values.ContactPhone,
      ShippingAddress: values.ShippingAddress,
      Categories: validCategories.map((c) => ({
        CategoryId: c.categoryId,
        Items: c.items.map((i) => ({
          ProductId: i.productId,
          ProposedQuantity: i.proposedQuantity,
          Note: i.note,
        })),
      })),
    };
  }, [selectedCategories, selectedApproverId, message]);

  const handleSubmit = useCallback(async (onSuccess?: () => void) => {
    try {
      const values = await formInstance?.validateFields() as IPurchaseRequest | undefined;
      if (!values) return;

      if (mode === "create") {
        const payload = preparePayload(values);
        if (!payload) return;
        createMutate(
          {
            resource: "purchase-requests",
            values: payload,
            successNotification: () => ({
              message: "Tạo phiếu thành công",
              type: "success",
            }),
          },
          {
            onSuccess: (response) => {
              const newId = (response as any)?.data?.Id ?? (response as any)?.Id;
              if (newId) {
                dataProvider.custom({
                  url: `/api/purchase-requests/${newId}/trigger`,
                  method: "post",
                  payload: { id: newId, action: "submit", note: "" },
                }).then(() => {
                  list("purchase-requests");
                }).catch(() => {
                  list("purchase-requests");
                });
              } else {
                list("purchase-requests");
              }
            },
            onError: (error: HttpError) =>
              message.error(error?.message || "Có lỗi xảy ra"),
          }
        );
      } else {
        const payload = {
          Id: formInstance?.getFieldValue("Id"),
          ...values,
          ApproverId: selectedApproverId,
          Categories: selectedCategories
            .filter((c) => c.items.length > 0)
            .map((c) => ({
              CategoryId: c.categoryId,
              Items: c.items.map((i) => ({
                Id: (i as any).id || 0,
                ProductId: i.productId,
                ProposedQuantity: i.proposedQuantity,
                Note: i.note,
              })),
            })),
        };
        form.formProps.onFinish?.(payload);
      }
      onSuccess?.();
    } catch {
      message.warning("Vui lòng kiểm tra lại các trường thông tin bắt buộc!");
    }
  }, [formInstance, form.formProps, mode, preparePayload, createMutate, list, message, selectedCategories, selectedApproverId]);

  const initEditData = useCallback(
    (
      initialData: any,
      cascadeLoadFn: (configId: number, deptId: number) => Promise<void>,
      productLoadFn: (catId: number) => Promise<ICascadeProduct[]>,
    ) => {
      if (!initialData?.Id || hasInitRef.current) return;

      formInstance?.setFieldsValue({
        Code: initialData.Code,
        DepartmentId: initialData.DepartmentId,
        ProposalConfigId: initialData.ProposalConfigId,
        Reason: initialData.Reason,
        ContactName: initialData.ContactName,
        ContactPhone: initialData.ContactPhone,
        ShippingAddress: initialData.ShippingAddress,
      });

      if (initialData.ProposalConfigId && initialData.DepartmentId) {
        cascadeLoadFn(initialData.ProposalConfigId, initialData.DepartmentId);
      }

      const existingCats = initialData.Categories ?? initialData.RequestCategories ?? [];
      if (existingCats.length > 0) {
        const mappedCats: ISelectedCategory[] = existingCats.map((cat: any) => {
          const catId = cat.CategoryId;
          productLoadFn(catId);
          return {
            categoryId: catId,
            categoryName: cat.Category?.Name ?? cat.Name ?? "Danh mục",
            allowedQuota: cat.Category?.AllowedQuota ?? cat.AllowedQuota ?? 0,
            items: (cat.RequestItems ?? []).map((item: any) => ({
              id: item.Id,
              productId: item.ProductId,
              productName: item.Product?.Name ?? "",
              unitPrice: item.UnitPrice ?? 0,
              unit: item.Product?.Unit ?? "",
              proposedQuantity: item.ProposedQuantity ?? 1,
              note: item.Note ?? "",
              rowId: generateRowId(),
            })),
          };
        });
        setSelectedCategories(mappedCats);
      }

      const savedApproverId = initialData.ApproverId;
      if (savedApproverId) {
        setSelectedApproverId(savedApproverId);
      }

      hasInitRef.current = true;
    },
    [formInstance]
  );

  const totalProposed = useMemo(
    () =>
      selectedCategories.reduce(
        (s, c) => s + c.items.reduce((s2, i) => s2 + i.unitPrice * i.proposedQuantity, 0