import { useForm, Create, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import { useMemo } from "react";
import type { IProposalConfig, ICategory, IDepartment, IProposalConfigPayload } from "./types";
import { ProposalConfigForm } from "./form";

export const CreateProposalConfig = () => {
  // KHẮC PHỤC 3: Rút trích hàm `onFinish` trực tiếp từ useForm và cấp Type Payload cho nó
  const { formProps, saveButtonProps, onFinish } = useForm<
    IProposalConfig, 
    HttpError, 
    IProposalConfigPayload // Báo cho Refine biết tôi sẽ gửi lên cục dữ liệu dạng này
  >({ 
    resource: "proposal-configs",
    action: "create",
    redirect: "edit" });

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
    <Create title="Tạo Cấu Hình Đề Xuất" saveButtonProps={{ ...saveButtonProps, children: "Lưu Cấu Hình" }}>
      <ProposalConfigForm
        formProps={{ ...formProps, onFinish }}
        saveButtonProps={saveButtonProps}
        categories={categories}
        departments={departments}
      />
    </Create>
  );
};
