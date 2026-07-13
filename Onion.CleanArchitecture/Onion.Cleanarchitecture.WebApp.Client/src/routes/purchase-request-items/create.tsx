import { useForm, Create } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";
import { IPurchaseRequestItem } from "./types";
export const CreatePurchaseRequestItem = () => {
  const { formProps, saveButtonProps } = useForm<IPurchaseRequestItem>({ redirect: "edit" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="PR Category ID" name="PurchaseRequestCategoryId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Product ID" name="ProductId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Unit Price" name="UnitPrice" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Proposed Quantity" name="ProposedQuantity" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Total Amount" name="TotalAmount"><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Actual Quantity" name="ActualQuantity"><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Actual Total Amount" name="ActualTotalAmount"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Form>
    </Create>
  );
};
