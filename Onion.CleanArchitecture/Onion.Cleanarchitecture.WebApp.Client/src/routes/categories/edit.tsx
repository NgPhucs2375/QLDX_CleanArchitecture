import { useForm, Edit } from "@refinedev/antd";
import { ICategory } from "./types";
import { Form, Input, Switch } from "antd";
export const EditCategory = () => {
  const { formProps, saveButtonProps } = useForm<ICategory>({
    redirect: "show",
  });
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden>
          <Input />
        </Form.Item>
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
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
