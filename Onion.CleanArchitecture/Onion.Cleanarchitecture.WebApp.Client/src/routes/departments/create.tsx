import { useForm, Create } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";
import { IDepartment } from "./types";
export const CreateDepartment = () => {
  const { formProps, saveButtonProps } = useForm<IDepartment>({ redirect: "edit" });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="Code" rules={[{ required: true, message: "Please input department code!" }, { max: 50, message: "Code must not exceed 50 characters!" }]}><Input /></Form.Item>
        <Form.Item label="Name" name="Name" rules={[{ required: true, message: "Please input department name!" }, { max: 200, message: "Name must not exceed 200 characters!" }]}><Input /></Form.Item>
        <Form.Item label="Manager ID" name="ManagerId"><Input /></Form.Item>
        <Form.Item label="Active" name="IsActive" valuePropName="checked"><Switch defaultChecked /></Form.Item>
      </Form>
    </Create>
  );
};
