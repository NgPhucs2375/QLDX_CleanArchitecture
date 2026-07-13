import { useShow } from "@refinedev/core";
import { IPurchaseRequestLog } from "./types";
import { Show, TextField } from "@refinedev/antd";
import { Typography } from "antd";

export const ShowPurchaseRequestLog = () => {
  const { queryResult: { isLoading, data } } = useShow<IPurchaseRequestLog>();
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Purchase Request ID</Typography.Title>
      <TextField value={data?.data?.PurchaseRequestId} />
      <Typography.Title level={5}>User ID</Typography.Title>
      <TextField value={data?.data?.UserId} />
      <Typography.Title level={5}>Action</Typography.Title>
      <TextField value={data?.data?.Action} />
      <Typography.Title level={5}>Note</Typography.Title>
      <TextField value={data?.data?.Note} />
    </Show>
  );
};
