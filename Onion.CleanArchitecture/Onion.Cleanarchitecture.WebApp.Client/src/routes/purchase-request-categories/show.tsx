import { useShow } from "@refinedev/core";
import { IPurchaseRequestCategory } from "./types";
import { Show, TextField, NumberField } from "@refinedev/antd";
import { Typography } from "antd";

export const ShowPurchaseRequestCategory = () => {
  const { queryResult: { isLoading, data } } = useShow<IPurchaseRequestCategory>();
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Purchase Request ID</Typography.Title>
      <TextField value={data?.data?.PurchaseRequestId} />
      <Typography.Title level={5}>Category ID</Typography.Title>
      <TextField value={data?.data?.CategoryId} />
      <Typography.Title level={5}>Allowed Quota</Typography.Title>
      <NumberField value={data?.data?.AllowedQuota} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Total Proposed Amount</Typography.Title>
      <NumberField value={data?.data?.TotalProposedAmount} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Difference</Typography.Title>
      <NumberField value={data?.data?.Difference} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Actual Total Amount</Typography.Title>
      <NumberField value={data?.data?.ActualTotalAmount} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Actual Difference</Typography.Title>
      <NumberField value={data?.data?.ActualDifference} options={{ style: "currency", currency: "VND" }} />
    </Show>
  );
};
