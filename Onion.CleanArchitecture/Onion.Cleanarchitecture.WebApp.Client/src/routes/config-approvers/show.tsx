import { useShow } from "@refinedev/core";
import { IConfigApprover } from "./types";
import { Show, TextField } from "@refinedev/antd";
import { Typography, Tag } from "antd";

const levelMap: Record<number, { label: string; color: string }> = {
  1: { label: "Department Level", color: "blue" },
  2: { label: "Control Level", color: "purple" },
};

export const ShowConfigApprover = () => {
  const { queryResult: { isLoading, data } } = useShow<IConfigApprover>();
  const level = data?.data?.Level;
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Proposal Config ID</Typography.Title>
      <TextField value={data?.data?.ProposalConfigId} />
      <Typography.Title level={5}>Department ID</Typography.Title>
      <TextField value={data?.data?.DepartmentId} />
      <Typography.Title level={5}>Approver ID</Typography.Title>
      <TextField value={data?.data?.ApproverId} />
      <Typography.Title level={5}>Level</Typography.Title>
      {level != null && <Tag color={levelMap[level]?.color}>{levelMap[level]?.label || level}</Tag>}
    </Show>
  );
};
