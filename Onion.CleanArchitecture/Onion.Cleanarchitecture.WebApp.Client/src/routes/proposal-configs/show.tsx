import { useShow } from "@refinedev/core";
import { IProposalConfig } from "./types";
import { Show, TextField, DateField } from "@refinedev/antd";
import { Typography, Tag } from "antd";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Draft", color: "default" },
  2: { label: "Active", color: "green" },
  3: { label: "Inactive", color: "red" },
};

export const ShowProposalConfig = () => {
  const { queryResult: { isLoading, data } } = useShow<IProposalConfig>();
  const status = data?.data?.Status;
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Code</Typography.Title>
      <TextField value={data?.data?.Code} />
      <Typography.Title level={5}>Name</Typography.Title>
      <TextField value={data?.data?.Name} />
      <Typography.Title level={5}>Effective Date</Typography.Title>
      <DateField value={data?.data?.EffectiveDate} format="LL" />
      <Typography.Title level={5}>Status</Typography.Title>
      {status != null && <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>}
    </Show>
  );
};
