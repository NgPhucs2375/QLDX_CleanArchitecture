import { useForm, Create } from "@refinedev/antd";
import { Form, Input } from "antd";
import { IPurchaseRequestLog } from "./types";
export const CreatePurchaseRequestLog = () => {
  const { formProps, saveButtonProps } = useForm<IPurchaseRequestLog>({ redirect: "edit" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Purchase Request ID" name="PurchaseRequestId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="User ID" name="UserId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Action" name="Action" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Note" name="Note"><Input.TextArea /></Form.Item>
      </Form>
    </Create>
  );
};
