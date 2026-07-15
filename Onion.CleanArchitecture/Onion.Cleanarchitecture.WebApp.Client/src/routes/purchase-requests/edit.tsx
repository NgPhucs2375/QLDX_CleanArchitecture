import { useForm, Edit } from "@refinedev/antd";
import { IPurchaseRequest } from "./types";
import { Form, Input, InputNumber, Select } from "antd";
export const EditPurchaseRequest = () => {
  const { formProps, saveButtonProps } = useForm<IPurchaseRequest>({ redirect: "show" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
        <Form.Item label="Code" name="Code" rules={[{ required: true }, { max: 50 }]}><Input /></Form.Item>
        <Form.Item label="Department ID" name="DepartmentId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Purchase Config ID" name="PurchaseConfigId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Status" name="Status">
          <Select options={[
            { value: 1, label: "Draft" },
            { value: 2, label: "Pending Department" },
            { value: 3, label: "Pending Control" },
            { value: 4, label: "Returned for Edit" },
            { value: 5, label: "Approved" },
            { value: 6, label: "Pending Order Confirm" },
            { value: 7, label: "Completed" },
            { value: 8, label: "Rejected by Dept" },
            { value: 9, label: "Rejected by Control" },
          ]} />
        </Form.Item>
        <Form.Item label="Total Proposed Amount" name="TotalProposedAmount"><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Total Actual Amount" name="TotalActualAmount"><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Form>
    </Edit>
  );
};
