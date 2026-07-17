import { useSelect } from "@refinedev/antd";
import { Form, Input, DatePicker, Select, Button, Space, Typography, Table, InputNumber, Row, Col, Popconfirm } from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined, SettingOutlined, TeamOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import type { FormProps } from "antd";
import type { SaveButtonProps } from "@refinedev/antd";
import type { IProposalConfig, ICategory, IDepartment, IConfigCategoryItem, IConfigApproverItem, IUser, IProposalConfigPayload } from "./types";

const { Text } = Typography;

const STYLES = `
  .pc-form { max-width: 100%; margin: 0 auto; padding: 0; font-size: 15px; }
  .pc-form .ant-form-item { margin-bottom: 20px; }
  .pc-form .ant-form-item-label > label { font-size: 15px; font-weight: 600; color: #3a4a5b; }
  .pc-form .ant-input, .pc-form .ant-select, .pc-form .ant-picker, .pc-form .ant-input-number { font-size: 15px !important; }
  
  .pc-card {
    background: #ffffff;
    border: 1px solid #e1e7ee;
    border-radius: 8px;
    padding: 0 0 24px 0;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(122, 157, 193, 0.05);
    overflow: hidden;
  }
  .pc-card-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%);
    border-bottom: 1px solid #e1e7ee;
    margin-bottom: 20px;
  }
  .pc-card-header h3 { font-size: 17px; font-weight: 700; margin: 0; color: #476481; }
  .pc-card-body { padding: 0 24px; }
  
  .pc-card-icon {
    width: 38px; height: 38px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .pc-card-icon.blue { background: #e6f4ff; color: #1677ff; }
  .pc-card-icon.green { background: #f0fdfa; color: #0d9488; }
  .pc-card-icon.purple { background: #f4f7fa; color: #476481; }

  .pc-empty-state {
    padding: 36px 24px; text-align: center;
    background: #f8fafc;
    border: 1px dashed #d3dfea;
    border-radius: 8px;
    margin: 0 24px;
  }
  .pc-empty-state p { margin: 0 0 14px; color: #6b7c93; font-size: 15px; }

  /* Ép kiểu Ant Design Table thành Xanh Ngọc Trai */
  .pc-table-wrapper { padding: 0 24px; overflow-x: auto; }
  .pc-table-wrapper .ant-table { font-size: 15px; border: 1px solid #e1e7ee; border-radius: 6px; overflow: hidden; }
  .pc-table-wrapper .ant-table-thead > tr > th {
    background: #7a9dc1 !important; 
    color: #ffffff !important; 
    font-weight: 600; 
    font-size: 15px;
    border-bottom: 2px solid #5d82a6 !important;
    white-space: nowrap;
    padding: 14px 16px;
  }
  .pc-table-wrapper .ant-table-tbody > tr > td { 
    padding: 14px 16px !important; 
    border-bottom: 1px solid #f2f6fb !important; 
    vertical-align: middle;
  }
  .pc-table-wrapper .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
  .pc-table-wrapper .ant-table-bordered .ant-table-cell { border-inline-end: 1px solid #e1e7ee !important; }

  .pc-add-row {
    display: flex; gap: 10px; align-items: center; padding: 16px 24px;
    flex-wrap: wrap; background: #f4f7fa; border-top: 1px solid #e1e7ee;
  }

  .pc-add-btn {
    margin: 0 24px; border: 1px dashed #c0d1e1; background: #fff;
    color: #7a9dc1; border-radius: 6px; padding: 10px 20px; font-weight: 600;
    font-size: 15px; cursor: pointer; width: calc(100% - 48px); transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .pc-add-btn:hover { border-color: #476481; background: #f0f4f9; }
`;

const vnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const APPROVAL_LEVELS = [
  { value: 1, label: "Cấp 1 - Trưởng đơn vị" },
  { value: 2, label: "Cấp 2 - Kiểm soát" },
];

// const PERIOD_TYPES = [
//   { value: 1, label: "Tháng" },
//   { value: 2, label: "Quý" },
//   { value: 3, label: "Năm" },
// ];

interface ICustomDate { toISOString: () => string; }
interface IProposalFormValues { Code: string; Name: string; EffectiveDate?: ICustomDate | string | Date; Status?: number; }
interface ProposalConfigFormProps { formProps: FormProps; saveButtonProps: SaveButtonProps; categories: ICategory[]; departments: IDepartment[]; initialData?: IProposalConfig; recordId?: number; }
interface IApiCategory { CategoryId: number; DepartmentId: number; AllowedQuota: number; PeriodType?: number; }
interface IApiApprover { DepartmentId: number; ApproverId: string; Level: number; Email?: string; Name?: string; }

const FIELD_STYLE: React.CSSProperties = { width: '100%' };

export const ProposalConfigForm = ({ formProps, categories, departments, initialData, recordId }: ProposalConfigFormProps) => {
  const { onFinish } = formProps;

  const { queryResult: userQueryResult } = useSelect<IUser>({
    resource: "users", optionLabel: "UserName", optionValue: "Id", pagination: { mode: "off" },
  });

  const users = useMemo(() => userQueryResult.data?.data ?? [], [userQueryResult.data]);

  const [configCategories, setConfigCategories] = useState<IConfigCategoryItem[]>([]);
  const [configApprovers, setConfigApprovers] = useState<IConfigApproverItem[]>([]);

  const [catAdding, setCatAdding] = useState(false);
  const [catNew, setCatNew] = useState<Partial<IConfigCategoryItem>>({});
  const [catEditKey, setCatEditKey] = useState<string | null>(null);
  const [catEditValues, setCatEditValues] = useState<Partial<IConfigCategoryItem>>({});

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
          categoryId: apiCat.CategoryId, departmentId: apiCat.DepartmentId, allowedQuota: apiCat.AllowedQuota,
          categoryName: catObj?.Name || '', departmentName: depObj?.Name || '', categoryCode: catObj?.Code || '',
          departmentCode: depObj?.Code || '', periodType: apiCat.PeriodType || 1,
        };
      });
      setConfigCategories(initialCats);

      const initialApprovers: IConfigApproverItem[] = (initialData.Approves || []).map(a => {
        const apiApp = a as unknown as IApiApprover;
        const depObj = departments.find(dep => dep.Id === apiApp.DepartmentId);
        return {
          departmentId: apiApp.DepartmentId, approverId: apiApp.ApproverId, level: apiApp.Level,
          departmentName: depObj?.Name || '', approverName: apiApp.ApproverId,
          levelLabel: APPROVAL_LEVELS.find(l => l.value === apiApp.Level)?.label || '',
          departmentCode: depObj?.Code || '', email: apiApp.Email || '', name: apiApp.Name || ''
        };
      });
      setConfigApprovers(initialApprovers);
    }
  }, [initialData, categories, departments]);

  const addCategory = (values: Partial<IConfigCategoryItem>) => {
    if (values.categoryId == null || values.departmentId == null) return;
    if (configCategories.some((c) => c.categoryId === values.categoryId && c.departmentId === values.departmentId)) return;
    const category = categories.find(c => c.Id === values.categoryId);
    const department = departments.find(d => d.Id === values.departmentId);

    setConfigCategories((prev) => [...prev, {
      categoryId: values.categoryId!, categoryName: category?.Name ?? '', categoryCode: category?.Code ?? '',
      departmentId: values.departmentId!, departmentName: department?.Name ?? '', departmentCode: department?.Code ?? '',
      allowedQuota: values.allowedQuota ?? 0, periodType: values.periodType ?? 1,
    }]);
    setCatAdding(false); setCatNew({});
  };

  const saveCatEdit = () => {
    if (!catEditKey || !catEditValues.categoryId || !catEditValues.departmentId) return;
    setConfigCategories((prev) => prev.map((c) => {
      if (`${c.categoryId}-${c.departmentId}` !== catEditKey) return c;
      const category = categories.find(cat => cat.Id === catEditValues.categoryId);
      const department = departments.find(d => d.Id === catEditValues.departmentId);
      return {
        categoryId: catEditValues.categoryId!, categoryName: category?.Name ?? '', categoryCode: category?.Code ?? '',
        departmentId: catEditValues.departmentId!, departmentName: department?.Name ?? '', departmentCode: department?.Code ?? '',
        allowedQuota: catEditValues.allowedQuota ?? c.allowedQuota, periodType: catEditValues.periodType ?? c.periodType,
      };
    }));
    setCatEditKey(null); setCatEditValues({});
  };

  const removeCategory = (categoryId: number, departmentId: number) => setConfigCategories((prev) => prev.filter((c) => !(c.categoryId === categoryId && c.departmentId === departmentId)));
  const startCatEdit = (record: IConfigCategoryItem) => { setCatEditKey(`${record.categoryId}-${record.departmentId}`); setCatEditValues({ ...record }); };
  const cancelCatEdit = () => { setCatEditKey(null); setCatEditValues({}); };

  const addApprover = (values: Partial<IConfigApproverItem>) => {
    if (values.departmentId == null || values.approverId == null || values.level == null) return;
    if (configApprovers.some((a) => a.departmentId === values.departmentId && a.approverId === values.approverId && a.level === values.level)) return;
    const department = departments.find(d => d.Id === values.departmentId);
    const user = users.find(u => u.Id === values.approverId);
    
    setConfigApprovers((prev) => [...prev, {
      departmentId: values.departmentId!, departmentName: department?.Name ?? '', departmentCode: department?.Code ?? '',
      approverId: values.approverId!, approverName: user?.UserName ?? values.approverId!, email: user?.Email ?? '',
      name: user?.UserName ?? '', level: values.level!, levelLabel: APPROVAL_LEVELS.find((l) => l.value === values.level)?.label ?? "",
    }]);
    setApprAdding(false); setApprNew({});
  };

  const saveApprEdit = () => {
    if (!apprEditKey || !apprEditValues.departmentId || !apprEditValues.approverId || !apprEditValues.level) return;
    setConfigApprovers((prev) => prev.map((a) => {
      if (`${a.departmentId}-${a.approverId}-${a.level}` !== apprEditKey) return a;
      const department = departments.find(d => d.Id === apprEditValues.departmentId);
      const user = users.find(u => u.Id === apprEditValues.approverId);
      return {
        departmentId: apprEditValues.departmentId!, departmentName: department?.Name ?? '', departmentCode: department?.Code ?? '',
        approverId: apprEditValues.approverId!, approverName: user?.UserName ?? apprEditValues.approverId!, email: user?.Email ?? '',
        name: user?.UserName ?? '', level: apprEditValues.level!, levelLabel: APPROVAL_LEVELS.find((l) => l.value === apprEditValues.level)?.label ?? "",
      };
    }));
    setApprEditKey(null); setApprEditValues({});
  };

  const removeApprover = (departmentId: number, approverId: string, level: number) => setConfigApprovers((prev) => prev.filter((a) => !(a.departmentId === departmentId && a.approverId === approverId && a.level === level)));
  const startApprEdit = (record: IConfigApproverItem) => { setApprEditKey(`${record.departmentId}-${record.approverId}-${record.level}`); setApprEditValues({ ...record }); };
  const cancelApprEdit = () => { setApprEditKey(null); setApprEditValues({}); };

  const handleSubmit = async (values: IProposalFormValues) => {
    if (!onFinish) return;
    try {
      let dateString = new Date().toISOString();
      const effDate = values.EffectiveDate;
      if (effDate) {
        if (typeof effDate === "string") dateString = new Date(effDate).toISOString();
        else if (effDate instanceof Date) dateString = effDate.toISOString();
        else if (typeof effDate === "object" && typeof (effDate as ICustomDate).toISOString === "function") dateString = (effDate as ICustomDate).toISOString();
      }

      const payload: IProposalConfigPayload = {
        ...(recordId ? { Id: recordId } : {}), Code: values.Code, Name: values.Name, EffectiveDate: dateString, Status: values.Status ?? 1,
        Categories: configCategories.map((c) => ({ CategoryId: c.categoryId, DepartmentId: c.departmentId, AllowedQuota: c.allowedQuota })),
        Approves: configApprovers.map((a) => ({ DepartmentId: a.departmentId, ApproverId: a.approverId, Level: a.level })),
      };
      await onFinish(payload);
    } catch (error) { console.error(error); }
  };

  const catColumns = [
    {
      title: "Danh mục", dataIndex: "categoryName",
      render: (text: string, record: IConfigCategoryItem) => {
        if (catEditKey === `${record.categoryId}-${record.departmentId}`) {
          return <Select value={catEditValues.categoryId} onChange={(val) => { const cat = categories.find(c => c.Id === val); setCatEditValues(prev => ({ ...prev, categoryId: val, categoryCode: cat?.Code ?? '', categoryName: cat?.Name ?? '' })); }} options={categories.map(c => ({ label: c.Name, value: c.Id }))} style={FIELD_STYLE} />;
        }
        return <Text strong style={{ color: '#3a4a5b' }}>{text}</Text>;
      },
    },
    {
      title: "Mã danh mục", dataIndex: "categoryCode", width: 130,
      render: (text: string, record: IConfigCategoryItem) => catEditKey === `${record.categoryId}-${record.departmentId}` ? <Input value={catEditValues.categoryCode} disabled style={FIELD_STYLE} /> : <Text style={{ color: '#8c98a5' }}>{text}</Text>,
    },
    {
      title: "Đơn vị áp dụng", dataIndex: "departmentName",
      render: (text: string, record: IConfigCategoryItem) => {
        if (catEditKey === `${record.categoryId}-${record.departmentId}`) {
          return <Select value={catEditValues.departmentId} onChange={(val) => { const dep = departments.find(d => d.Id === val); setCatEditValues(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' })); }} options={departments.map(d => ({ label: d.Name, value: d.Id }))} style={FIELD_STYLE} />;
        }
        return text;
      },
    },
    {
      title: "Mã ĐV", dataIndex: "departmentCode", width: 130,
      render: (text: string, record: IConfigCategoryItem) => catEditKey === `${record.categoryId}-${record.departmentId}` ? <Input value={catEditValues.departmentCode} disabled style={FIELD_STYLE} /> : <Text style={{ color: '#8c98a5' }}>{text}</Text>,
    },
    {
      title: "Định mức cho phép", dataIndex: "allowedQuota", width: 190,
      render: (v: number, record: IConfigCategoryItem) => {
        if (catEditKey === `${record.categoryId}-${record.departmentId}`) {
          return <InputNumber value={catEditValues.allowedQuota} onChange={(val) => setCatEditValues(prev => ({ ...prev, allowedQuota: val ?? 0 }))} min={0} style={FIELD_STYLE} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />;
        }
        return <Text strong style={{ fontVariantNumeric: 'tabular-nums', color: '#7a9dc1', fontSize: 16 }}>{vnd(v)}</Text>;
      },
    },
    {
      title: "", width: 90, align: "center" as const,
      render: (_text: unknown, record: IConfigCategoryItem) => {
        if (catEditKey === `${record.categoryId}-${record.departmentId}`) {
          return (
            <Space>
              <Button type="primary" style={{ background: '#7a9dc1', borderColor: '#7a9dc1' }} size="small" icon={<CheckOutlined />} onClick={saveCatEdit} />
              <Button size="small" icon={<CloseOutlined />} onClick={cancelCatEdit} />
            </Space>
          );
        }
        return (
          <Space>
            <Button type="text" style={{ color: '#7a9dc1' }} size="small" icon={<EditOutlined />} onClick={() => startCatEdit(record)} />
            <Popconfirm title="Xóa cấu hình này?" onConfirm={() => removeCategory(record.categoryId, record.departmentId)} okText="Xóa" cancelText="Hủy">
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const catFooter = () => catAdding ? (
    <div className="pc-add-row">
      <Select placeholder="Chọn danh mục" value={catNew.categoryId} onChange={(val) => { const cat = categories.find(c => c.Id === val); setCatNew(prev => ({ ...prev, categoryId: val, categoryCode: cat?.Code ?? '', categoryName: cat?.Name ?? '' })); }} options={categories.map(c => ({ label: c.Name, value: c.Id }))} style={{ width: 220 }} />
      <Input value={catNew.categoryCode} disabled placeholder="Mã DM" style={{ width: 120 }} />
      <Select placeholder="Chọn đơn vị" value={catNew.departmentId} onChange={(val) => { const dep = departments.find(d => d.Id === val); setCatNew(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' })); }} options={departments.map(d => ({ label: d.Name, value: d.Id }))} style={{ width: 220 }} />
      <Input value={catNew.departmentCode} disabled placeholder="Mã ĐV" style={{ width: 120 }} />
      <InputNumber placeholder="Định mức tiền..." value={catNew.allowedQuota} onChange={(val) => setCatNew(prev => ({ ...prev, allowedQuota: val ?? 0 }))} min={0} style={{ width: 180 }} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
      <Space style={{ marginLeft: 'auto' }}>
        <Button type="primary" style={{ background: '#7a9dc1', borderColor: '#7a9dc1' }} icon={<CheckOutlined />} onClick={() => addCategory(catNew)}>Lưu</Button>
        <Button icon={<CloseOutlined />} onClick={() => { setCatAdding(false); setCatNew({}); }}>Hủy</Button>
      </Space>
    </div>
  ) : (
    <div className="pc-add-btn" onClick={() => setCatAdding(true)}>
      <PlusOutlined /> Bổ sung danh mục định mức
    </div>
  );

  const apprColumns = [
    {
      title: "Đơn vị áp dụng", dataIndex: "departmentName",
      render: (text: string, record: IConfigApproverItem) => {
        if (apprEditKey === `${record.departmentId}-${record.approverId}-${record.level}`) {
          return <Select value={apprEditValues.departmentId} onChange={(val) => { const dep = departments.find(d => d.Id === val); setApprEditValues(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' })); }} options={departments.map(d => ({ label: d.Name, value: d.Id }))} style={FIELD_STYLE} />;
        }
        return <Text strong style={{ color: '#3a4a5b' }}>{text}</Text>;
      },
    },
    {
      title: "Mã ĐV", dataIndex: "departmentCode", width: 130,
      render: (text: string, record: IConfigApproverItem) => apprEditKey === `${record.departmentId}-${record.approverId}-${record.level}` ? <Input value={apprEditValues.departmentCode} disabled style={FIELD_STYLE} /> : <Text style={{ color: '#8c98a5' }}>{text}</Text>,
    },
    {
      title: "Tài khoản người duyệt", dataIndex: "approverName",
      render: (text: string, record: IConfigApproverItem) => {
        if (apprEditKey === `${record.departmentId}-${record.approverId}-${record.level}`) {
          return <Select value={apprEditValues.approverId} onChange={(val) => { const user = users.find(u => u.Id === val); setApprEditValues(prev => ({ ...prev, approverId: val, email: user?.Email ?? '', name: user?.UserName ?? '', approverName: user?.UserName ?? val })); }} style={FIELD_STYLE} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} options={users.map(u => ({ label: u.UserName, value: u.Id }))} />;
        }
        return <Text style={{ color: '#7a9dc1', fontWeight: 600 }}>{text}</Text>;
      },
    },
    {
      title: "Cấp độ duyệt", dataIndex: "levelLabel", width: 220,
      render: (text: string, record: IConfigApproverItem) => {
        if (apprEditKey === `${record.departmentId}-${record.approverId}-${record.level}`) {
          return <Select value={apprEditValues.level} onChange={(val) => setApprEditValues(prev => ({ ...prev, level: val }))} options={APPROVAL_LEVELS} style={FIELD_STYLE} />;
        }
        return <span style={{ background: '#e6edf4', padding: '4px 12px', borderRadius: 20, color: '#476481', fontWeight: 600, fontSize: 13 }}>{text}</span>;
      },
    },
    {
      title: "", width: 90, align: "center" as const,
      render: (_text: unknown, record: IConfigApproverItem) => {
        if (apprEditKey === `${record.departmentId}-${record.approverId}-${record.level}`) {
          return (
            <Space>
              <Button type="primary" style={{ background: '#7a9dc1', borderColor: '#7a9dc1' }} size="small" icon={<CheckOutlined />} onClick={saveApprEdit} />
              <Button size="small" icon={<CloseOutlined />} onClick={cancelApprEdit} />
            </Space>
          );
        }
        return (
          <Space>
            <Button type="text" style={{ color: '#7a9dc1' }} size="small" icon={<EditOutlined />} onClick={() => startApprEdit(record)} />
            <Popconfirm title="Xóa người duyệt này?" onConfirm={() => removeApprover(record.departmentId, record.approverId, record.level)} okText="Xóa" cancelText="Hủy">
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const apprFooter = () => apprAdding ? (
    <div className="pc-add-row">
      <Select placeholder="Chọn đơn vị" value={apprNew.departmentId} onChange={(val) => { const dep = departments.find(d => d.Id === val); setApprNew(prev => ({ ...prev, departmentId: val, departmentCode: dep?.Code ?? '', departmentName: dep?.Name ?? '' })); }} options={departments.map(d => ({ label: d.Name, value: d.Id }))} style={{ width: 220 }} />
      <Input value={apprNew.departmentCode} disabled placeholder="Mã ĐV" style={{ width: 120 }} />
      <Select placeholder="Chọn tài khoản duyệt" value={apprNew.approverId} onChange={(val) => { const user = users.find(u => u.Id === val); setApprNew(prev => ({ ...prev, approverId: val, email: user?.Email ?? '', name: user?.UserName ?? '', approverName: user?.UserName ?? val })); }} style={{ width: 220 }} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} options={users.map(u => ({ label: u.UserName, value: u.Id }))} />
      <Select placeholder="Cấp độ duyệt" value={apprNew.level} onChange={(val) => setApprNew(prev => ({ ...prev, level: val }))} options={APPROVAL_LEVELS} style={{ width: 220 }} />
      <Space style={{ marginLeft: 'auto' }}>
        <Button type="primary" style={{ background: '#7a9dc1', borderColor: '#7a9dc1' }} icon={<CheckOutlined />} onClick={() => addApprover(apprNew)}>Lưu</Button>
        <Button icon={<CloseOutlined />} onClick={() => { setApprAdding(false); setApprNew({}); }}>Hủy</Button>
      </Space>
    </div>
  ) : (
    <div className="pc-add-btn" onClick={() => setApprAdding(true)}>
      <PlusOutlined /> Phân bổ nhân sự kiểm duyệt
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <Form {...formProps} layout="vertical" className="pc-form" onFinish={handleSubmit}>
        
        {/* BLOCK 1: THÔNG TIN CHUNG */}
        <div className="pc-card">
          <div className="pc-card-header">
            <div className="pc-card-icon blue"><InfoCircleOutlined /></div>
            <h3>Thông tin thiết lập chung</h3>
          </div>
          <div className="pc-card-body">
            <Row gutter={[32, 0]}>
              <Col xs={24} lg={12}>
                <Form.Item name="Code" label="Mã quy chuẩn cấu hình" rules={[{ required: true, message: "Vui lòng nhập mã!" }, { max: 50 }]}>
                  <Input size="large" placeholder="VD: CFG-2026-Q3" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="Name" label="Tên gọi cấu hình" rules={[{ required: true, message: "Vui lòng nhập tên!" }, { max: 200 }]}>
                  <Input size="large" placeholder="VD: Định mức mua sắm văn phòng phẩm Quý 3" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="EffectiveDate" label="Thời gian bắt đầu hiệu lực" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
                  <DatePicker size="large" style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item name="Status" label="Trạng thái triển khai" initialValue={1}>
                  <Select
                    size="large"
                    options={[
                      { value: 1, label: "Bản nháp (Draft)" },
                      { value: 2, label: "Đang áp dụng (Active)" },
                      { value: 3, label: "Ngưng áp dụng (Inactive)" },
                    ]}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        {/* BLOCK 2: DANH MỤC VÀ ĐỊNH MỨC */}
        <div className="pc-card">
          <div className="pc-card-header">
            <div className="pc-card-icon green"><SettingOutlined /></div>
            <h3>Quản lý danh mục & Thiết lập định mức (Quota)</h3>
          </div>

          {configCategories.length === 0 && !catAdding && (
            <div className="pc-empty-state">
              <p>Hệ thống chưa ghi nhận cấu hình danh mục nào cho quy chuẩn này.</p>
              <Button type="primary" style={{ background: '#7a9dc1', border: 'none' }} icon={<PlusOutlined />} onClick={() => setCatAdding(true)}>
                Khởi tạo danh mục đầu tiên
              </Button>
            </div>
          )}

          {configCategories.length > 0 && (
            <div className="pc-table-wrapper" style={{ marginBottom: catAdding ? 0 : 24 }}>
              <Table
                dataSource={configCategories}
                rowKey={(r) => `${r.categoryId}-${r.departmentId}`}
                pagination={false}
                bordered
                columns={catColumns}
              />
            </div>
          )}
          
          {(configCategories.length > 0 || catAdding) && catFooter()}
        </div>

        {/* BLOCK 3: QUY TRÌNH PHÊ DUYỆT */}
        <div className="pc-card">
          <div className="pc-card-header">
            <div className="pc-card-icon purple"><TeamOutlined /></div>
            <h3>Thiết lập cây thư mục nhân sự phê duyệt</h3>
          </div>

          {configApprovers.length === 0 && !apprAdding && (
            <div className="pc-empty-state">
              <p>Chưa có luồng nhân sự nào được gán quyền phê duyệt.</p>
              <Button type="primary" style={{ background: '#7a9dc1', border: 'none' }} icon={<PlusOutlined />} onClick={() => setApprAdding(true)}>
                Thiết lập người phê duyệt
              </Button>
            </div>
          )}

          {configApprovers.length > 0 && (
            <div className="pc-table-wrapper" style={{ marginBottom: apprAdding ? 0 : 24 }}>
              <Table
                dataSource={configApprovers}
                rowKey={(r) => `${r.departmentId}-${r.approverId}-${r.level}`}
                pagination={false}
                bordered
                columns={apprColumns}
              />
            </div>
          )}

          {(configApprovers.length > 0 || apprAdding) && apprFooter()}
        </div>
      </Form>
    </>
  );
};