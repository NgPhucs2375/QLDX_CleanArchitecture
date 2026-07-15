import { useForm, Edit, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import { useMemo } from "react";
import dayjs from "dayjs";
import { Typography } from "antd";
import type { IProposalConfig, ICategory, IDepartment, IProposalConfigPayload } from "./types";
import { ProposalConfigForm } from "./form";
const { Title } = Typography;
export const EditProposalConfig = () => {
  const { formProps, saveButtonProps, queryResult, onFinish } = useForm<
    IProposalConfig,
    HttpError,
    IProposalConfigPayload
  >({ redirect: "list" });

  const initialData = queryResult?.data?.data;

  // Sửa lại formProps để định dạng lại ngày tháng trước khi đưa vào Form
  const editableFormProps = {
    ...formProps,
    initialValues: initialData ? { ...initialData, EffectiveDate: dayjs(initialData.EffectiveDate) } : {},
  };

  const { queryResult: categoryQueryResult } = useSelect<ICategory>({ resource: "categories", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" }, filters: [{ field: "IsActive", operator: "eq", value: true }] });
  const { queryResult: deptQueryResult } = useSelect<IDepartment>({ resource: "departments", optionLabel: "Name", optionValue: "Id", pagination: { mode: "off" }, filters: [{ field: "IsActive", operator: "eq", value: true }] });

  const categories = useMemo(() => categoryQueryResult.data?.data ?? [], [categoryQueryResult.data]);
  const departments = useMemo(() => deptQueryResult.data?.data ?? [], [deptQueryResult.data]);

  return (
    <Edit 
    title={<Title level={3} style={{ margin: 0 }}>Chỉnh sửa Cấu hình Đề xuất</Title>}
    saveButtonProps={{ ...saveButtonProps, children: "Lưu Chỉnh Sửa" }}>
      <ProposalConfigForm
        formProps={{ ...editableFormProps, onFinish }}
        saveButtonProps={saveButtonProps}
        categories={categories}
        departments={departments}
        initialData={initialData}
        recordId={initialData?.Id}
      />
    </Edit>
  );
};
