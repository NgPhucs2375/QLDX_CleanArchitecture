import { useSelect } from "@refinedev/antd";
import { Form, Input, DatePicker, Select, Button, Space, Typography, Table, InputNumber, Row, Col, Popconfirm } from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import type { FormProps } from "antd";
import type { SaveButtonProps } from "@refinedev/antd";
import type { IProposalConfig, ICategory, IDepartment, IConfigCategoryItem, IConfigApproverItem, IUser } from "./types";

const { Text } = Typography;

const vnd = (n: number) => n.toLocaleString("vi-VN") + " VND";

const APPROVAL_LEVELS = [
  { value: 1, label: "Cấp 1 - Trưởng đơn vị" },
  { value: 2, label: "Cấp 2 - Kiểm soát" },
];

const PERIOD_TYPES = [
  { value: 1, label: "Tháng" },
  { value: 2, label: "Quý" },
  { value: 3, label: "Năm" },
];

interface IProposalConfigPayload {
  Id?: number;
  Code: string;
  Name: string;
  EffectiveDate: string;
  Status: number;
  Categories: { CategoryId: number; DepartmentId: number; AllowedQuota: number }[];
  Approves: { DepartmentId: number; ApproverId: string; Level: number }[];
}

interface ICustomDate {
  toISOString: () => string;
}

interface IProposalFormValues {
  Code: string;
  Name: string;
  EffectiveDate?: ICustomDate | string | Date;
  Status?: number;
}

interface ProposalConfigFormProps {
  formProps: FormProps;
  saveButtonProps: SaveButtonProps;
  categories: ICategory[];
  departments: IDepartment[];
  initialData?: IProposalConfig;
  recordId?: number;
}

interface IApiCategory {
  CategoryId: number;
  DepartmentId: number;
  AllowedQuota: number;
  PeriodType?: number;
}

interface IApiApprover {
  DepartmentId: number;
  ApproverId: string;
  Level: number;
  Email?: string;
  Name?: string;
}

const FIELD_STYLE: React.CSSProperties = { width: '100%' };

export const ProposalConfigForm = ({ formProps, categories, departments, initialData, recordId }: ProposalConfigFormProps) => {
  const { onFinish } = formProps;

  const { queryResult: userQueryResult } = useSelect<IUser>({
    resource: "users",
    optionLabel: "UserName",
    optionValue: "Id",
    pagination: { mode: "off" },
  });

  const users = useMemo(() => userQueryResult.data?.data ?? [], [userQueryResult.data]);

  const [configCategories, setConfigCategories] = useState<IConfigCategoryItem[]>([]);
  const [configApprovers, setConfigApprovers] = useState<IConfigApproverItem[]>([]);

  // --- Category inline states ---
  const [catAdding, setCatAdding] = useState(false);
  const [catNew, setCatNew] = useState<Partial<IConfigCategoryItem>>({});
  const [catEditKey, setCatEditKey] = useState<string | null>(null);
  const [catEditValues, setCatEditValues] = useState<Partial<IConfigCategoryItem>>({});

  // --- Approver inline states ---
  const [apprAdding, setApprAdding] = useState(false);
  const [apprNew, setApprNew] = useState<Partial<IConfigApproverItem>>({});
  const [apprEditKey, setApprEditKey] = useState<string | null>(null);
  const [apprEditValues, setApprEditValues] = useState<Partial<IConfigApproverItem>>({});

  useEffect(() => {
    if (initialData) {
      const initialCats: IConfigCategoryItem[] = (initialData.Categories || []).map(c => {
        const apiCat = c as unknown as IApiCategory;
        const catObj = categories.find(cat => cat.Id === apiCat.CategoryId);
        const depObj = departments.find(dep => dep.Id === apiCat.DepartmentId);
        return {
          categoryId: apiCat.CategoryId,
          departmentId: apiCat.DepartmentId,
          allowedQuota: apiCat.AllowedQuota,
          categoryName: catObj?.Name || '',
          departmentName: depObj?.Name || '',
          categoryCode: catObj?.Code || '',
          departmentCode: depObj?.Code || '',
          periodType: apiCat.PeriodType || 1,
        };
      });
      setConfigCategories(initialCats);

      const initialApprovers: IConfigApproverItem[] = (initialData.Approves || []).map(a => {
        const apiApp = a as unknown as IApiApprover;
        const depObj = departments.find(dep => dep.Id === apiApp.DepartmentId);
        return {
          departmentId: apiApp.DepartmentId,
          approverId: apiApp.ApproverId,
          level: apiApp.Level,
          departmentName: depObj?.Name || '',
          approverName: apiApp.ApproverId,
          levelLabel: APPROVAL_LEVELS.find(l => l.value === apiApp.Level)?.label || '',
          departmentCode: depObj?.Code || '',
          email: apiApp.Email || '',
          name: apiApp.Name || ''
        };
      });
      setConfigApprovers(initialApprovers);
    }
  }, [initialData, categories, departments]);

  // --- Category handlers ---
  const addCategory = (values: Partial<IConfigCategoryItem>) => {
    if (values.categoryId == null || values.departmentId == null) return;
    const exists = configCategories.some(
      (c) => c.categoryId === values.categoryId && c.departmentId === values.departmentId
    );
    if (exists) return;

    const category = categories.find(c => c.Id === values.categoryId);
    const department = departments.find(d => d.Id === values.departmentId);

    setConfigCategories((prev) => [
      ...prev,
      {
        categoryId: values.categoryId!,
        categoryName: category?.Name ?? '',
        categoryCode: category?.Code ?? '',
        departmentId: values.departmentId!,
        departmentName: department?.Name ?? '',
        departmentCode: department?.Code ?? '',
        allowedQuota: values.allowedQuota ?? 0,
        periodType: values.periodType ?? 1,
      },
    ]);
    setCatAdding(false);
    setCatNew({});
  };

  const saveCatEdit = () => {
    if (!catEditKey || !catEditValues.categoryId || !catEditValues.departmentId) return;
    setConfigCategories((prev) =>
      prev.map((c) => {
        if (`${c.categoryId}-${c.departmentId}` !== catEditKey) return c;
        const category = categories.find(cat => cat.Id === catEditValues.categoryId);
        const department = departments.find(d => d.Id === catEditValues.departmentId);
        return {
          categoryId: catEditValues.categoryId!,
          categoryName: category?.Name ?? '',
          categoryCode: category?.Code ?? '',
          departmentId: catEditValues.departmentId!,
          departmentName: department?.Name ?? '',
          departmentCode: department?.Code ?? '',
          allowedQuota: catEditValues.allowedQuota ?? c.allowedQuota,
          periodType: catEditValues.periodType ?? c.periodType,
        };
      })
    );
    setCatEditKey(null);
    setCatEditValues({});
  };

  const removeCategory = (categoryId: number, departmentId: number) => {
    setConfigCategories((prev) => prev.filter((c) => !(c.categoryId === categoryId && c.departmentId === departmentId)));
  };

  const startCatEdit = (record: IConfigCategoryItem) => {
    setCatEditKey(`${record.categoryId}-${record.departmentId}`);
    setCatEditValues({ ...record });
  };

  const cancelCatEdit = () => {
    setCatEditKey(null);
    setCatEditValues({});
  };

  // --- Approver handlers ---
  const addApprover = (values: Partial<IConfigApproverItem>) => {
    if (values.departmentId == null || values.approverId == null || values.level == null) return;
    const exists = configApprovers.some(
      (a) => a.departmentId === values.departmentId && a.approverId === values.approverId && a.level === values.level
    );
    if (exists) return;

    const department = departments.find(d => d.Id === values.departmentId);
    const user = users.find(u => u.Id === values.approverId);
    const levelLabel = APPROVAL_LEVELS.find((l) => l.value === values.level)?.label ?? "";

    setConfigApprovers((prev) => [
      ...prev,
      {
        departmentId: values.departmentId!,
        departmentName: department?.Name ?? '',
        departmentCode: department?.Code ?? '',
        approverId: values.approverId!,
        approverName: user?.UserName ?? values.approverId!,
        email: user?.Email ?? '',
        name: user?.UserName ?? '',
        level: values.level!,
        levelLabel,
      },
    ]);
    setApprAdding(false);
    setApprNew({});
  };

  const saveApprEdit = () => {
    if (!apprEditKey || !apprEditValues.departmentId || !apprEditValues.approverId || !apprEditValues.level) return;
    setConfigApprovers((prev) =>
      prev.map((a) => {
        if (`${a.departmentId}-${a.approverId}-${a.level}` !== apprEditKey) return a;
        const department = departments.find(d => d.Id === apprEditValues.departmentId);
        const user = users.find(u => u.Id === apprEditValues.approverId);
        const levelLabel = APPROVAL_LEVELS.find((l) => l.value === apprEditValues.level)?.label ?? "";
        return {
          departmentId: apprEditValues.departmentId!,
          departmentName: department?.Name ?? '',
          departmentCode: department?.Code ?? '',
          approverId: apprEditValues.approverId!,
          approverName: user?.UserName ?? apprEditValues.approverId!,
          email: user?.Email ?? '',
          name: user?.UserName ?? '',
          level: apprEditValues.level!,
          levelLabel,
        };
      })
    );
    setApprEditKey(null);
    setApprEditValues({});
  };

  const removeApprover = (departmentId: number, approverId: string, level: number) => {
    setConfigApprovers((prev) => prev.filter((a) => !(a.departmentId === departmentId && a.approverId === approverId && a.level === level)));
  };

  const startApprEdit = (record: IConfigApproverItem) => {
    setApprEditKey(`${record.departmentId}-${record.approverId}-${record.level}`);
    setApprEditValues({ ...record });
  };

  const cancelApprEdit = () => {
    setApprEditKey(null);
    setApprEditValues({});
  };

  const handleSubmit = async (values: IProposalFormValues) => {
    if (!onFinish) return;

    try {
      let dateString = new Date().toISOString();
      const effDate = values.EffectiveDate;

      if (effDate) {
        if (typeof effDate === "string") {
          dateString = new Date(effDate).toISOString();
        } else if (effDate instanceof Date) {
          dateString = effDate.toISOString();
        } else if (typeof effDate === "object" && typeof (effDate as ICustomDate).toISOString === "function") {
          dateString = (effDate as ICustomDate).toISOString();
        }
      }

      const payload: IProposalConfigPayload = {
        ...(recordId ? { Id: recordId } : {}),
        Code: values.Code,
        Name: values.Name,
        EffectiveDate: dateString,
        Status: values.Status ?? 1,
        Categories: configCategories.map((c) => ({
          CategoryId: c.categoryId,
          DepartmentId: c.departmentId,
          AllowedQuota: c.allowedQuota,
        })),
        Approves: configApprovers.map((a) => ({
          DepartmentId: a.departmentId,
          ApproverId: a.approverId,
          Level: a.level,
        })),
      };

      await onFinish(payload);
    } catch (error) {
      console.error(error);
    }
  };

  const catColumns = [
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      width: 160,
      render: (text: string, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return (
            <Select
              value={catEditValues.categoryId}
              onChange={(val: number) => {
                const cat = categories.find(c => c.Id === val);
                setCatEditValues(prev => ({
                  ...prev,
                  categoryId: val,
                  categoryCode: cat?.Code ?? '',
                  categoryName: cat?.Name ?? '',
                }));
              }}
              options={categories.map(c => ({ label: c.Name, value: c.Id }))}
              style={FIELD_STYLE}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Mã danh mục",
      dataIndex: "categoryCode",
      width: 120,
      render: (text: string, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return <Input value={catEditValues.categoryCode} disabled style={FIELD_STYLE} />;
        }
        return text;
      },
    },
    {
      title: "Đơn vị áp dụng",
      dataIndex: "departmentName",
      width: 160,
      render: (text: string, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return (
            <Select
              value={catEditValues.departmentId}
              onChange={(val: number) => {
                const dep = departments.find(d => d.Id === val);
                setCatEditValues(prev => ({
                  ...prev,
                  departmentId: val,
                  departmentCode: dep?.Code ?? '',
                  departmentName: dep?.Name ?? '',
                }));
              }}
              options={departments.map(d => ({ label: d.Name, value: d.Id }))}
              style={FIELD_STYLE}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Mã đơn vị",
      dataIndex: "departmentCode",
      width: 120,
      render: (text: string, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return <Input value={catEditValues.departmentCode} disabled style={FIELD_STYLE} />;
        }
        return text;
      },
    },
    {
      title: "Loại kỳ",
      dataIndex: "periodType",
      width: 100,
      render: (v: number, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return (
            <Select
              value={catEditValues.periodType}
              onChange={(val) => setCatEditValues(prev => ({ ...prev, periodType: val }))}
              options={PERIOD_TYPES}
              style={FIELD_STYLE}
            />
          );
        }
        return PERIOD_TYPES.find(p => p.value === v)?.label ?? "";
      },
    },
    {
      title: "Định mức cho phép",
      dataIndex: "allowedQuota",
      width: 180,
      render: (v: number, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return (
            <InputNumber
              value={catEditValues.allowedQuota}
              onChange={(val) => setCatEditValues(prev => ({ ...prev, allowedQuota: val ?? 0 }))}
              min={0}
              style={FIELD_STYLE}
            />
          );
        }
        return <Text strong>{vnd(v)}</Text>;
      },
    },
    {
      title: "",
      width: 100,
      render: (_text: unknown, record: IConfigCategoryItem) => {
        const key = `${record.categoryId}-${record.departmentId}`;
        if (catEditKey === key) {
          return (
            <Space>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={saveCatEdit} />
              <Button size="small" icon={<CloseOutlined />} onClick={cancelCatEdit} />
            </Space>
          );
        }
        return (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => startCatEdit(record)} />
            <Popconfirm title="Xóa danh mục này?" onConfirm={() => removeCategory(record.categoryId, record.departmentId)} okText="Xóa" cancelText="Hủy">
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const catFooter = () => catAdding ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', flexWrap: 'wrap' }}>
      <Select
        placeholder="Chọn danh mục"
        value={catNew.categoryId}
        onChange={(val: number) => {
          const cat = categories.find(c => c.Id === val);
          setCatNew(prev => ({ ...prev, categoryId: val, categoryCode: cat?.Code ?? '', categoryName: cat?.Name ?? '' }));
        }}
        options={categories.map(c => ({ label: c.Name, value: c.Id }))}
        style={{ width: 160 }}
      />
      <Input value={catNew.categoryCode} disabled placeholder="Mã DM" style={{ width: 120 }} />
      <Select
        placeholder="Chọn đơn vị"
        value={catNew.departmentId}
        onChange={(val: number) => {
          const dep = departments.find(d => d.Id === val);
          setCatNew(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' }));
        }}
        options={departments.map(d => ({ label: d.Name, value: d.Id }))}
        style={{ width: 160 }}
      />
      <Input value={catNew.departmentCode} disabled placeholder="Mã ĐV" style={{ width: 120 }} />
      <Select
        placeholder="Loại kỳ"
        value={catNew.periodType}
        onChange={(val) => setCatNew(prev => ({ ...prev, periodType: val }))}
        options={PERIOD_TYPES}
        style={{ width: 100 }}
      />
      <InputNumber
        placeholder="Định mức"
        value={catNew.allowedQuota}
        onChange={(val) => setCatNew(prev => ({ ...prev, allowedQuota: val ?? 0 }))}
        min={0}
        style={{ width: 160 }}
      />
      <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => addCategory(catNew)} />
      <Button size="small" icon={<CloseOutlined />} onClick={() => { setCatAdding(false); setCatNew({}); }} />
    </div>
  ) : (
    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setCatAdding(true)}>
      Thêm danh mục
    </Button>
  );

  const apprColumns = [
    {
      title: "Đơn vị",
      dataIndex: "departmentName",
      width: 140,
      render: (text: string, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return (
            <Select
              value={apprEditValues.departmentId}
              onChange={(val: number) => {
                const dep = departments.find(d => d.Id === val);
                setApprEditValues(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' }));
              }}
              options={departments.map(d => ({ label: d.Name, value: d.Id }))}
              style={FIELD_STYLE}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Mã đơn vị",
      dataIndex: "departmentCode",
      width: 100,
      render: (text: string, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return <Input value={apprEditValues.departmentCode} disabled style={FIELD_STYLE} />;
        }
        return text;
      },
    },
    {
      title: "Người duyệt",
      dataIndex: "approverName",
      width: 140,
      render: (text: string, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return (
            <Select
              value={apprEditValues.approverId}
              onChange={(val: string) => {
                const user = users.find(u => u.Id === val);
                setApprEditValues(prev => ({
                  ...prev,
                  approverId: val,
                  email: user?.Email ?? '',
                  name: user?.UserName ?? '',
                  approverName: user?.UserName ?? val,
                }));
              }}
              style={FIELD_STYLE}
              showSearch
              filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
              options={users.map(u => ({ label: u.UserName, value: u.Id }))}
            />
          );
        }
        return text;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 180,
      render: (text: string, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return <Input value={apprEditValues.email} disabled style={FIELD_STYLE} />;
        }
        return text;
      },
    },
    {
      title: "Tên",
      dataIndex: "name",
      width: 140,
      render: (text: string, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return <Input value={apprEditValues.name} disabled style={FIELD_STYLE} />;
        }
        return text;
      },
    },
    {
      title: "Cấp duyệt",
      dataIndex: "levelLabel",
      width: 160,
      render: (text: string, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return (
            <Select
              value={apprEditValues.level}
              onChange={(val) => setApprEditValues(prev => ({ ...prev, level: val }))}
              options={APPROVAL_LEVELS}
              style={FIELD_STYLE}
            />
          );
        }
        return text;
      },
    },
    {
      title: "",
      width: 100,
      render: (_text: unknown, record: IConfigApproverItem) => {
        const key = `${record.departmentId}-${record.approverId}-${record.level}`;
        if (apprEditKey === key) {
          return (
            <Space>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={saveApprEdit} />
              <Button size="small" icon={<CloseOutlined />} onClick={cancelApprEdit} />
            </Space>
          );
        }
        return (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => startApprEdit(record)} />
            <Popconfirm title="Xóa người duyệt này?" onConfirm={() => removeApprover(record.departmentId, record.approverId, record.level)} okText="Xóa" cancelText="Hủy">
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const apprFooter = () => apprAdding ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', flexWrap: 'wrap' }}>
      <Select
        placeholder="Chọn đơn vị"
        value={apprNew.departmentId}
        onChange={(val: number) => {
          const dep = departments.find(d => d.Id === val);
          setApprNew(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' }));
        }}
        options={departments.map(d => ({ label: d.Name, value: d.Id }))}
        style={{ width: 140 }}
      />
      <Input value={apprNew.departmentCode} disabled placeholder="Mã ĐV" style={{ width: 100 }} />
      <Select
        placeholder="Chọn người duyệt"
        value={apprNew.approverId}
        onChange={(val: string) => {
          const user = users.find(u => u.Id === val);
          setApprNew(prev => ({
            ...prev,
            approverId: val,
            email: user?.Email ?? '',
            name: user?.UserName ?? '',
            approverName: user?.UserName ?? val,
          }));
        }}
        style={{ width: 140 }}
        showSearch
        filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())}
        options={users.map(u => ({ label: u.UserName, value: u.Id }))}
      />
      <Input value={apprNew.email} disabled placeholder="Email" style={{ width: 180 }} />
      <Input value={apprNew.name} disabled placeholder="Tên" style={{ width: 140 }} />
      <Select
        placeholder="Cấp duyệt"
        value={apprNew.level}
        onChange={(val) => setApprNew(prev => ({ ...prev, level: val }))}
        options={APPROVAL_LEVELS}
        style={{ width: 160 }}
      />
      <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => addApprover(apprNew)} />
      <Button size="small" icon={<CloseOutlined />} onClick={() => { setApprAdding(false); setApprNew({}); }} />
    </div>
  ) : (
    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setApprAdding(true)}>
      Thêm người duyệt
    </Button>
  );

  return (
    <Form {...formProps} layout="vertical" style={{ maxWidth: 1080, margin: "0 auto", padding: 20 }} onFinish={handleSubmit}>
      <div style={{ marginBottom: 16, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 6, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Thông tin chung</h3>
        </div>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item name="Code" label="Mã cấu hình" rules={[{ required: true, message: "Vui lòng nhập mã!" }, { max: 50 }]}>
              <Input placeholder="VD: CFG-2024-Q3" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item name="Name" label="Tên cấu hình" rules={[{ required: true, message: "Vui lòng nhập tên!" }, { max: 200 }]}>
              <Input placeholder="VD: Đề xuất mua VPP & CNTT quý 3/2026" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item name="EffectiveDate" label="Ngày hiệu lực" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item name="Status" label="Trạng thái" initialValue={1}>
              <Select
                options={[
                  { value: 1, label: "Nháp" },
                  { value: 2, label: "Đang áp dụng" },
                  { value: 3, label: "Ngưng áp dụng" },
                ]}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div style={{ marginBottom: 16, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 6, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Danh mục & Định mức</h3>
        </div>

        {configCategories.length === 0 && !catAdding && (
          <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", border: "1px dashed #d9d9d9", borderRadius: 6, marginBottom: 16 }}>
            <p style={{ margin: "0 0 8px", color: "rgba(0,0,0,0.45)" }}>Chưa có danh mục nào được cấu hình.</p>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => setCatAdding(true)}>
              Thêm danh mục
            </Button>
          </div>
        )}

        {configCategories.length > 0 && (
          <Table
            dataSource={configCategories}
            rowKey={(r) => `${r.categoryId}-${r.departmentId}`}
            pagination={false}
            bordered
            columns={catColumns}
            footer={catFooter}
            style={{ marginBottom: 16 }}
          />
        )}

        {configCategories.length === 0 && catAdding && (
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: 16, marginBottom: 16 }}>
            {catFooter()}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 6, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Nhân sự phê duyệt</h3>
        </div>

        {configApprovers.length === 0 && !apprAdding && (
          <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", border: "1px dashed #d9d9d9", borderRadius: 6, marginBottom: 16 }}>
            <p style={{ margin: "0 0 8px", color: "rgba(0,0,0,0.45)" }}>Chưa có nhân sự nào được cấu hình.</p>
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => setApprAdding(true)}>
              Thêm người duyệt
            </Button>
          </div>
        )}

        {configApprovers.length > 0 && (
          <Table
            dataSource={configApprovers}
            rowKey={(r) => `${r.departmentId}-${r.approverId}-${r.level}`}
            pagination={false}
            bordered
            columns={apprColumns}
            footer={apprFooter}
            style={{ marginBottom: 16 }}
          />
        )}

        {configApprovers.length === 0 && apprAdding && (
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: 16, marginBottom: 16 }}>
            {apprFooter()}
          </div>
        )}
      </div>
    </Form>
  );
};
