import { useForm, Create, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";
import { IProduct } from "./types";
export const CreateProduct = () => {
  const { formProps, saveButtonProps } = useForm<IProduct>({
    redirect: "edit",
  });

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    optionLabel: "Name",
    optionValue: "Id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Code"
          name="Code"
          rules={[
            { required: true, message: "Please input product code!" },
            { max: 50, message: "Code must not exceed 50 characters!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Name"
          name="Name"
          rules={[
            { required: true, message: "Please input product name!" },
            { max: 255, message: "Product name must not exceed 255 characters!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Category"
          name="CategoryId"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select {...categorySelectProps} />
        </Form.Item>
        <Form.Item
          label="Unit Price"
          name="UnitPrice"
          rules={[{ required: true, message: "Please input unit price!" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          label="Unit"
          name="Unit"
          rules={[{ required: true, message: "Please input unit!" }]}
        >
          <Input placeholder="e.g. Cái, Chiếc, Hộp" />
        </Form.Item>
        <Form.Item label="Active" name="IsActive" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>
      </Form>
    </Create>
  );
};
