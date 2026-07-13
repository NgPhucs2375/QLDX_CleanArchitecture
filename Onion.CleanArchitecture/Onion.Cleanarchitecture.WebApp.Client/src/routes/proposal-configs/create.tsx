import { useForm, Create } from "@refinedev/antd";
import { Form, Input, DatePicker, Select } from "antd";
import { IProposalConfig } from "./types";
export const CreateProposalConfig = () => {
  const { formProps, saveButtonProps } = useForm<IProposalConfig>({ redirect: "edit" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="Code" rules={[{ required: true, message: "Please input config code!" }, { max: 50 }]}><Input /></Form.Item>
        <Form.Item label="Name" name="Name" rules={[{ required: true, message: "Please input config name!" }, { max: 200 }]}><Input /></Form.Item>
        <Form.Item label="Effective Date" name="EffectiveDate" rules={[{ required: true, message: "Please select effective date!" }]}><DatePicker style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Status" name="Status" initialValue={1}><Select options={[{ value: 1, label: "Draft" }, { value: 2, label: "Active" }, { value: 3, label: "Inactive" }]} /></Form.Item>
      </Form>
    </Create>
  );
};
