import { useForm, Edit, useSelect } from "@refinedev/antd";
import { IConfigCategory } from "./types";
import { Form, Input, InputNumber, Select } from "antd";

export const EditConfigCategory = () => {
  const { formProps, saveButtonProps } = useForm<IConfigCategory>({ redirect: "show" });

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
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden>
          <Input />
        </Form.Item>
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
        <Form.Item label="Số tiền đã sử dụng" name="UsedAmount">
          <InputNumber style={{ width: "100%" }} disabled />
        </Form.Item>
        <Form.Item label="Số tiền còn lại" name="RemainingAmount">
          <InputNumber style={{ width: "100%" }} disabled />
        </Form.Item>
      </Form>
    </Edit>
  );
};
