import { useForm, Create } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";
import { ICategory } from "./types";
export const CreateCategory = () => {
  const { formProps, saveButtonProps } = useForm<ICategory>({
    redirect: "edit",
  });
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Code"
          name="Code"
          rules={[
            { required: true, message: "Please input category code!" },
            { max: 50, message: "Code must not exceed 50 characters!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Name"
          name="Name"
          rules={[
            { required: true, message: "Please input category name!" },
            { max: 200, message: "Name must not exceed 200 characters!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Active" name="IsActive" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
      </Form>
    </Create>
  );
};
