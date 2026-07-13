import { useForm, Edit } from "@refinedev/antd";
import { IPurchaseRequestLog } from "./types";
import { Form, Input } from "antd";
export const EditPurchaseRequestLog = () => {
  const { formProps, saveButtonProps } = useForm<IPurchaseRequestLog>({ redirect: "show" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
        <Form.Item label="Purchase Request ID" name="PurchaseRequestId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="User ID" name="UserId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Action" name="Action" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Note" name="Note"><Input.TextArea rows={3} /></Form.Item>
      </Form>
    </Edit>
  );
};
