import { useShow } from "@refinedev/core";
import { IPurchaseRequestItem } from "./types";
import { Show, TextField, NumberField } from "@refinedev/antd";
import { Typography } from "antd";

export const ShowPurchaseRequestItem = () => {
  const { queryResult: { isLoading, data } } = useShow<IPurchaseRequestItem>();
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>PR Category ID</Typography.Title>
      <TextField value={data?.data?.PurchaseRequestCategoryId} />
      <Typography.Title level={5}>Product ID</Typography.Title>
      <TextField value={data?.data?.ProductId} />
      <Typography.Title level={5}>Unit Price</Typography.Title>
      <NumberField value={data?.data?.UnitPrice} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Proposed Quantity</Typography.Title>
      <TextField value={data?.data?.ProposedQuantity} />
      <Typography.Title level={5}>Total Amount</Typography.Title>
      <NumberField value={data?.data?.TotalAmount} options={{ style: "currency", currency: "VND" }} />
      <Typography.Title level={5}>Actual Quantity</Typography.Title>
      <TextField value={data?.data?.ActualQuantity} />
      <Typography.Title level={5}>Actual Total Amount</Typography.Title>
      <NumberField value={data?.data?.ActualTotalAmount} options={{ style: "currency", currency: "VND" }} />
    </Show>
  );
};
