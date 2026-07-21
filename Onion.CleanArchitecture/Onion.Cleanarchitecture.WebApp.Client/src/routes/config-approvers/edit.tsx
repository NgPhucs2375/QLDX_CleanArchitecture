import { useForm, Edit, useSelect } from "@refinedev/antd";
import { IConfigApprover } from "./types";
import { Form, Input, Select } from "antd";
export const EditConfigApprover = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<IConfigApprover>({ redirect: "show" });

  const { selectProps: userSelectProps } = useSelect({
    resource: "users",
    optionLabel: "UserName",
    optionValue: "Id",
    defaultValue: queryResult?.data?.data?.ApproverId,
  });

  const { selectProps: departmentSelectProps } = useSelect({
    resource: "departments",
    optionLabel: "Name",
    optionValue: "Id",
    defaultValue: queryResult?.data?.data?.DepartmentId,
  });

  const { selectProps: configSelectProps } = useSelect({
    resource: "proposal-configs",
    optionLabel: "Name",
    optionValue: "Id",
    defaultValue: queryResult?.data?.data?.ProposalConfigId,
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
        <Form.Item label="Proposal Config" name="ProposalConfigId" rules={[{ required: true }]}>
          <Select {...configSelectProps} placeholder="Chọn cấu hình đề xuất..." showSearch />
        </Form.Item>
        <Form.Item label="Department" name="DepartmentId" rules={[{ required: true }]}>
          <Select {...departmentSelectProps} placeholder="Chọn phòng ban..." showSearch />
        </Form.Item>
        <Form.Item label="Approver (Người duyệt)" name="ApproverId" rules={[{ required: true }]}>
          <Select
            {...userSelectProps}
            placeholder="Tìm và chọn người duyệt..."
            showSearch
            filterOption={(input, option) =>
              (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item label="Level" name="Level" rules={[{ required: true }]}>
          <Select options={[{ value: 1, label: "Department Level" }, { value: 2, label: "Control Level" }]} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
