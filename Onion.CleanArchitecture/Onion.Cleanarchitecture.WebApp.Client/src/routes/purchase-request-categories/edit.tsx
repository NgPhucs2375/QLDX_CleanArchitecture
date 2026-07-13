import { useForm, Edit } from "@refinedev/antd";
import { IPurchaseRequestCategory } from "./types";
import { Form, Input, InputNumber } from "antd";
export const EditPurchaseRequestCategory = () => {
  const { formProps, saveButtonProps } = useForm<IPurchaseRequestCategory>({ redirect: "show" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
        <Form.Item label="Purchase Request ID" name="PurchaseRequestId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Category ID" name="CategoryId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Allowed Quota" name="AllowedQuota" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Total Proposed Amount" name="TotalProposedAmount" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Difference" name="Difference"><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Actual Total Amount" name="ActualTotalAmount"><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Actual Difference" name="ActualDifference"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Form>
    </Edit>
  );
};
