import { useShow } from "@refinedev/core";
import { IDepartment } from "./types";
import { Show, TextField } from "@refinedev/antd";
import { Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export const ShowDepartment = () => {
  const { queryResult: { isLoading, data } } = useShow<IDepartment>();
  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />
      <Typography.Title level={5}>Code</Typography.Title>
      <TextField value={data?.data?.Code} />
      <Typography.Title level={5}>Name</Typography.Title>
      <TextField value={data?.data?.Name} />
      <Typography.Title level={5}>Manager ID</Typography.Title>
      <TextField value={data?.data?.ManagerId} />
      <Typography.Title level={5}>Active</Typography.Title>
      {data?.data?.IsActive ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />}
    </Show>
  );
};
