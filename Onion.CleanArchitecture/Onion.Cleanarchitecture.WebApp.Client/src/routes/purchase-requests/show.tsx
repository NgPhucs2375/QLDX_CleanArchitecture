import { useShow, DateField } from "@refinedev/core";
import { IPurchaseRequest } from "./types";
import { Show, TextField, NumberField } from "@refinedev/antd";
import { Typography, Tag } from "antd";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Draft", color: "default" },
  2: { label: "Pending Dept", color: "orange" },
  3: { label: "Pending Control", color: "blue" },
  4: { label: "Returned", color: "red" },
  5: { label: "Approved", color: "green" },
  6: { label: "Pending Order", color: "purple" },
  7: { label: "Completed", color: "cyan" },
  8: { label: "Rejected", color: "red" },
};

export const ShowPurchaseRequest = () => {
  const { queryResult: { isLoading, data } } = useShow<IPurchaseRequest>();
  const status = data?.data?.Status;
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Code</Typography.Title>
      <TextField value={data?.data?.Code} />
      <Typography.Title level={5}>Department ID</Typography.Title>
      <TextField value={data?.data?.DepartmentId} />
      <Typography.Title level={5}>Purchase Config ID</Typography.Title>
      <TextField value={data?.data?.PurchaseConfigId} />
      <Typography.Title level={5}>Status</Typography.Title>
      {status != null && <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>}
      <Typography.Title level={5}>Total Proposed Amount</Typography.Title>
      <NumberField value={data?.data?.TotalProposedAmount} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Total Actual Amount</Typography.Title>
      <NumberField value={data?.data?.TotalActualAmount} options={{ style: "currency", currency: "VND" }} />
    </Show>
  );
};
