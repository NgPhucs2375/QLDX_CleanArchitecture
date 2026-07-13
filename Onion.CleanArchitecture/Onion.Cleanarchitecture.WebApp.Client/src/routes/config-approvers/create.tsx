import { useForm, Create } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IConfigApprover } from "./types";
export const CreateConfigApprover = () => {
  const { formProps, saveButtonProps } = useForm<IConfigApprover>({ redirect: "edit" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Proposal Config ID" name="ProposalConfigId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Department ID" name="DepartmentId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Approver ID" name="ApproverId" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Level" name="Level" rules={[{ required: true }]} initialValue={1}>
          <Select options={[{ value: 1, label: "Department Level" }, { value: 2, label: "Control Level" }]} />
        </Form.Item>
      </Form>
    </Create>
  );
};
