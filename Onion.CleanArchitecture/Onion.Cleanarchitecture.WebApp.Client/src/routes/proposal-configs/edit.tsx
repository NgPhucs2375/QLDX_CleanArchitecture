import { useForm, Edit } from "@refinedev/antd";
import { IProposalConfig } from "./types";
import { Form, Input, DatePicker, Select } from "antd";
import dayjs from "dayjs";
export const EditProposalConfig = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IProposalConfig>({ redirect: "show" });
  const data = queryResult?.data?.data;
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
        <Form.Item label="Code" name="Code" rules={[{ required: true }, { max: 50 }]}><Input /></Form.Item>
        <Form.Item label="Name" name="Name" rules={[{ required: true }, { max: 200 }]}><Input /></Form.Item>
        <Form.Item label="Effective Date" name="EffectiveDate" rules={[{ required: true }]} getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}><DatePicker style={{ width: "100%" }} /></Form.Item>
        <Form.Item label="Status" name="Status"><Select options={[{ value: 1, label: "Draft" }, { value: 2, label: "Active" }, { value: 3, label: "Inactive" }]} /></Form.Item>
      </Form>
    </Edit>
  );
};
