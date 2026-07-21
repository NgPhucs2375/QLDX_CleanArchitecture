import { useForm, Create, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { IConfigApprover } from "./types";
export const CreateConfigApprover = () => {
  const { formProps, saveButtonProps } = useForm<IConfigApprover>({ redirect: "edit" });
  const { selectProps: userSelectProps } = useSelect({
    resource: "users",
    optionLabel: "UserName",
    optionValue: "Id",
  });

  const { selectProps: departmentSelectProps } = useSelect({
    resource: "departments",
    optionLabel: "Name",
    optionValue: "Id",
  });

  const { selectProps: configSelectProps } = useSelect({
    resource: "proposal-configs",
    optionLabel: "Name",
    optionValue: "Id",
  });
 
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
        <Form.Item label="Level" name="Level" rules={[{ required: true }]} initialValue={1}>
          <Select options={[
            { value: 1, label: "Department Level (Cấp 1)" }, 
            { value: 2, label: "Control Level (Cấp 2)" }
          ]} />
        </Form.Item>
      </Form>
    </Create>
  );
};
