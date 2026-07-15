import { useForm, Create, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import { useMemo } from "react";
import type { IProposalConfig, ICategory, IDepartment, IProposalConfigPayload } from "./types";
import { ProposalConfigForm } from "./form";
import { Typography } from "antd";
const { Title } = Typography; // 2. Lấy component Title

export const CreateProposalConfig = () => {
  const { formProps, saveButtonProps, onFinish } = useForm<
    IProposalConfig,
    HttpError,
    IProposalConfigPayload
  >({
    resource: "proposal-configs",
    action: "create",
    redirect: "edit",
  });

  const { queryResult: categoryQueryResult } = useSelect<ICategory>({
    resource: "categories",
    optionLabel: "Name",
    optionValue: "Id",
    pagination: { mode: "off" },
    filters: [{ field: "IsActive", operator: "eq", value: true }],
  });

  const { queryResult: deptQueryResult } = useSelect<IDepartment>({
    resource: "departments",
    optionLabel: "Name",
    optionValue: "Id",
    pagination: { mode: "off" },
    filters: [{ field: "IsActive", operator: "eq", value: true }],
  });

  const categories = useMemo(
    () => categoryQueryResult.data?.data ?? [],
    [categoryQueryResult.data]
  );

  const departments = useMemo(
    () => deptQueryResult.data?.data ?? [],
    [deptQueryResult.data]
  );

  return (
    <Create 
    title={<Title level={3} style={{ margin: 0 }}>Tạo Cấu Hình Đề Xuất</Title>}
    saveButtonProps={{ ...saveButtonProps, children: "Lưu Cấu Hình" }}>
      <ProposalConfigForm
        formProps={{ ...formProps, onFinish }}
        saveButtonProps={saveButtonProps}
        categories={categories}
        departments={departments}
      />
    </Create>
  );
};