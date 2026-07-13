import { useForm, Create } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";
import { IConfigCategory } from "./types";
export const CreateConfigCategory = () => {
  const { formProps, saveButtonProps } = useForm<IConfigCategory>({ redirect: "edit" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Proposal Config ID" name="ProposalConfigId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Category ID" name="CategoryId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Department ID" name="DepartmentId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Allowed Quota" name="AllowedQuota" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Used Amount" name="UsedAmount" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Remaining Amount" name="RemainingAmount" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
      </Form>
    </Create>
  );
};
