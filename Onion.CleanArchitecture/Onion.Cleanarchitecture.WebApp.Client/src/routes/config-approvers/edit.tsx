import { useForm, Edit } from "@refinedev/antd";
import { IConfigApprover } from "./types";
import { Form, Input, Select } from "antd";
export const EditConfigApprover = () => {
  const { formProps, saveButtonProps } = useForm<IConfigApprover>({ redirect: "show" });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
        <Form.Item label="Proposal Config ID" name="ProposalConfigId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Department ID" name="DepartmentId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Approver ID" name="ApproverId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Level" name="Level" rules={[{ required: true }]}>
          <Select options={[{ value: 1, label: "Department Level" }, { value: 2, label: "Control Level" }]} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
