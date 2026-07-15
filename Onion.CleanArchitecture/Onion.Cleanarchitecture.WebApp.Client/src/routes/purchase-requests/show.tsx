import { useShow, useCustomMutation, useApiUrl } from "@refinedev/core";
import { DateField } from "@refinedev/antd";
import { IPurchaseRequest } from "./types";
import { Show, TextField, NumberField } from "@refinedev/antd";
import { Typography, Tag, Button, Space, Modal, App } from "antd";
import { useNavigate } from "react-router-dom";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Draft", color: "default" },
  2: { label: "Pending Dept", color: "orange" },
  3: { label: "Pending Control", color: "blue" },
  4: { label: "Returned", color: "red" },
  5: { label: "Approved", color: "green" },
  6: { label: "Pending Order", color: "purple" },
  7: { label: "Completed", color: "cyan" },
  8: { label: "Rejected by Dept", color: "red" },
  9: { label: "Rejected by Control", color: "red" },
};

const availableActions: Record<number, { label: string; endpoint: string; action: string; color: string }[]> = {
  1: [{ label: "Submit", endpoint: "submit", action: "submit", color: "blue" }],
  2: [
    { label: "Approve Dept", endpoint: "approve-department", action: "approve-department", color: "green" },
    { label: "Reject", endpoint: "reject", action: "reject", color: "red" },
  ],
  3: [
    { label: "Approve", endpoint: "approve", action: "approve", color: "green" },
    { label: "Reject", endpoint: "reject", action: "reject", color: "red" },
    { label: "Return", endpoint: "return-for-edit", action: "return-for-edit", color: "orange" },
  ],
  4: [{ label: "Submit Again", endpoint: "submit", action: "submit", color: "blue" }],
  5: [{ label: "Confirm Order", endpoint: "confirm-order", action: "confirm-order", color: "purple" }],
  6: [{ label: "Complete", endpoint: "complete", action: "complete", color: "cyan" }],
};

export const ShowPurchaseRequest = () => {
  const { queryResult: { isLoading, data }, refetch } = useShow<IPurchaseRequest>();
  const { mutate, isLoading: isMutating } = useCustomMutation();
  const apiUrl = useApiUrl();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const status = data?.data?.Status;
  const record = data?.data;
  const actions = status != null ? availableActions[status] : undefined;

  const handleAction = (endpoint: string, label: string) => {
    Modal.confirm({
      title: `Confirm ${label}`,
      content: `Are you sure you want to ${label.toLowerCase()} this request?`,
      okText: "Yes",
      cancelText: "Cancel",
      onOk: () => {
        mutate(
          {
            url: `${apiUrl}/purchase-requests/${record!.Id}/${endpoint}`,
            method: "post",
            values: {},
          },
          {
            onSuccess: () => {
              message.success(`${label} successful`);
              refetch();
            },
            onError: (error: any) => {
              message.error(error?.response?.data?.message || `${label} failed`);
            },
          }
        );
      },
    });
  };

  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={record?.Id} />
      <Typography.Title level={5}>Code</Typography.Title>
      <TextField value={record?.Code} />
      <Typography.Title level={5}>Department ID</Typography.Title>
      <TextField value={record?.DepartmentId} />
      <Typography.Title level={5}>Purchase Config ID</Typography.Title>
      <TextField value={record?.PurchaseConfigId} />
      <Typography.Title level={5}>Status</Typography.Title>
      {status != null && <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>}
      <Typography.Title level={5}>Total Proposed Amount</Typography.Title>
      <NumberField value={record?.TotalProposedAmount} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Total Actual Amount</Typography.Title>
      <NumberField value={record?.TotalActualAmount} options={{ style: "currency", currency: "VND" }} />

      {actions && actions.length > 0 && (
        <>
          <Typography.Title level={5} style={{ marginTop: 24 }}>Workflow Actions</Typography.Title>
          <Space>
            {actions.map((action) => (
              <Button
                key={action.endpoint}
                type="primary"
                danger={action.color === "red"}
                style={{ backgroundColor: action.color === "green" ? "#52c41a" : action.color === "purple" ? "#722ed1" : action.color === "cyan" ? "#13c2c2" : action.color === "orange" ? "#fa8c16" : undefined }}
                loading={isMutating}
                onClick={() => handleAction(action.endpoint, action.label)}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        </>
      )}
    </Show>
  );
};
