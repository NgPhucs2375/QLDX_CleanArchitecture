import { useForm, Edit, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import { useMemo } from "react";
import { Typography, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IProposalConfig, ICategory, IDepartment, IProposalConfigPayload } from "./types";
import { ProposalConfigForm } from "./form";
import "../../assets/proposal-config.css"; 

const { Title } = Typography;

export const EditProposalConfig = () => {
  const { formProps, saveButtonProps, queryResult, onFinish } = useForm<
    IProposalConfig,
    HttpError,
    IProposalConfigPayload
  >({ redirect: "list" });

  const initialData = queryResult?.data?.data;

  const editableFormProps = {
    ...formProps,
    initialValues: initialData ? { ...initialData, EffectiveDate: dayjs(initialData.EffectiveDate) } : {},
  };

  const { queryResult: categoryQueryResult } = useSelect<ICategory>({ 
    resource: "categories", 
    optionLabel: "Name", 
    optionValue: "Id", 
    pagination: { mode: "off" }, 
    filters: [{ field: "IsActive", operator: "eq", value: true }] 
  });
  
  const { queryResult: deptQueryResult } = useSelect<IDepartment>({ 
    resource: "departments", 
    optionLabel: "Name", 
    optionValue: "Id", 
    pagination: { mode: "off" }, 
    filters: [{ field: "IsActive", operator: "eq", value: true }] 
  });

  const categories = useMemo(() => categoryQueryResult.data?.data ?? [], [categoryQueryResult.data]);
  const departments = useMemo(() => deptQueryResult.data?.data ?? [], [deptQueryResult.data]);

  return (
    <Edit 
      isLoading={queryResult?.isLoading}
      title={<Title level={3} className="pc-m-0 pc-text-ocean pc-font-bold">Cập nhật cấu hình đề xuất</Title>}
      footerButtons={
        <Button 
          type="primary" 
          onClick={saveButtonProps.onClick} 
          loading={saveButtonProps.loading}
          size="large" 
          icon={<SaveOutlined />}
          className="pc-btn-primary"
        >
          Lưu thay đổi
        </Button>
      }
    >
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