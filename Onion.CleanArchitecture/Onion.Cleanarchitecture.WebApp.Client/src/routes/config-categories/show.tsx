import { useShow } from "@refinedev/core";
import { IConfigCategory } from "./types";
import { Show, TextField, NumberField } from "@refinedev/antd";
import { Typography } from "antd";

export const ShowConfigCategory = () => {
  const { queryResult: { isLoading, data } } = useShow<IConfigCategory>();
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Proposal Config ID</Typography.Title>
      <TextField value={data?.data?.ProposalConfigId} />
      <Typography.Title level={5}>Category ID</Typography.Title>
      <TextField value={data?.data?.CategoryId} />
      <Typography.Title level={5}>Department ID</Typography.Title>
      <TextField value={data?.data?.DepartmentId} />
      <Typography.Title level={5}>Allowed Quota</Typography.Title>
      <NumberField value={data?.data?.AllowedQuota} options={{ style: "decimal" }} />
      <Typography.Title level={5}>Used Amount</Typography.Title>
      <NumberField value={data?.data?.UsedAmount} options={{ style: "decimal" }} />
      <Typography.Title level={5}>Remaining Amount</Typography.Title>
      <NumberField value={data?.data?.RemainingAmount} options={{ style: "decimal" }} />
    </Show>
  );
};
