import { useShow } from "@refinedev/core";
import { IProduct } from "./types";
import { Show, TextField } from "@refinedev/antd";
import { Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export const ShowProduct = () => {
  const {
    queryResult: { isLoading, data },
  } = useShow<IProduct>();

  return (
    <Show isLoading={isLoading}>
      <Typography.Title level={5}>Id</Typography.Title>
      <TextField value={data?.data.Id} />

      <Typography.Title level={5}>Code</Typography.Title>
      <TextField value={data?.data?.Code} />

      <Typography.Title level={5}>Name</Typography.Title>
      <TextField value={data?.data?.Name} />

      <Typography.Title level={5}>CategoryId</Typography.Title>
      <TextField value={data?.data?.CategoryId} />

      <Typography.Title level={5}>Unit Price</Typography.Title>
      <TextField value={data?.data?.UnitPrice} />

      <Typography.Title level={5}>Unit</Typography.Title>
      <TextField value={data?.data?.Unit} />

      <Typography.Title level={5}>Active</Typography.Title>
      {data?.data?.IsActive ? (
        <CheckCircleOutlined style={{ color: "green" }} />
      ) : (
        <CloseCircleOutlined style={{ color: "red" }} />
      )}
    </Show>
  );
};
