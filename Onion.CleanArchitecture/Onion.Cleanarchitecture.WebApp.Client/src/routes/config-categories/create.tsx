import { useForm, Create, useSelect } from "@refinedev/antd";
import { Form, InputNumber, Select } from "antd";
import { IConfigCategory } from "./types";

export const CreateConfigCategory = () => {
  const { formProps, saveButtonProps } = useForm<IConfigCategory>({ redirect: "list" });

  const { selectProps: proposalConfigSelectProps } = useSelect({
    resource: "proposal-configs",
    optionLabel: "Name",
    optionValue: "Id",
    pagination: { mode: "off" },
  });

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    optionLabel: "Name",
    optionValue: "Id",
  });

  const { selectProps: departmentSelectProps } = useSelect({
    resource: "departments",
    optionLabel: "Name",
    optionValue: "Id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Cấu hình đề xuất"
          name="ProposalConfigId"
          rules={[{ required: true, message: "Vui lòng chọn cấu hình đề xuất!" }]}
        >
          <Select {...proposalConfigSelectProps} />
        </Form.Item>
        <Form.Item
          label="Danh mục"
          name="CategoryId"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select {...categorySelectProps} />
        </Form.Item>
        <Form.Item
          label="Đơn vị áp dụng"
          name="DepartmentId"
          rules={[{ required: true, message: "Vui lòng chọn đơn vị áp dụng!" }]}
        >
          <Select {...departmentSelectProps} />
        </Form.Item>
        <Form.Item
          label="Định mức cho phép"
          name="AllowedQuota"
          rules={[{ required: true, message: "Vui lòng nhập định mức!" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Create>
  );
};
