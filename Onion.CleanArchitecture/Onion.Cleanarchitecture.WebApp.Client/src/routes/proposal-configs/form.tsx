import { Form, Input, DatePicker, Select, Button, Space, Typography, Row, Col, Card, Empty, InputNumber, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import { useMemo, useEffect } from "react";
import type { FormProps } from "antd";
import type { SaveButtonProps } from "@refinedev/antd";
import type { IProposalConfig, ICategory, IDepartment, IUser, IProposalConfigPayload } from "./types";
import dayjs from "dayjs";
import "../../assets/proposal-config.css";

const { Text } = Typography;

interface ProposalConfigFormProps {
  formProps: FormProps;
  saveButtonProps: SaveButtonProps;
  categories: ICategory[];
  departments: IDepartment[];
  initialData?: IProposalConfig;
  recordId?: number;
}

export const ProposalConfigForm = ({ formProps, categories, departments, initialData, recordId }: ProposalConfigFormProps) => {
  const { onFinish, form } = formProps; // Lấy instance form từ formProps
  
  const { queryResult: userQueryResult } = useSelect<IUser>({ resource: "users", optionLabel: "UserName", optionValue: "Id", pagination: { mode: "off" } });
  const users = useMemo(() => userQueryResult.data?.data ?? [], [userQueryResult.data]);

  // Đổ dữ liệu vào Form chuẩn Ant Design (nếu là màn Edit)
  useEffect(() => {
    if (initialData && form) {
      form.setFieldsValue({
        Code: initialData.Code,
        Name: initialData.Name,
        EffectiveDate: dayjs(initialData.EffectiveDate),
        Status: initialData.Status,
        Categories: initialData.Categories || [],
        Approves: initialData.Approves || [] 
      });
    }
  }, [initialData, form]);

  // Xử lý Submit mượt mà với structure tự động của Form.List
  const handleSubmit = async (values: any) => {
    if (!onFinish) return;
    const payload: IProposalConfigPayload = {
      ...(recordId ? { Id: recordId } : {}),
      Code: values.Code,
      Name: values.Name,
      EffectiveDate: values.EffectiveDate ? values.EffectiveDate.toISOString() : new Date().toISOString(),
      Status: values.Status ?? 1,
      Categories: values.Categories || [],
      Approves: values.Approves || [],
    };
    await onFinish(payload);
  };

  return (
    <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
      
      {/* 1. THÔNG TIN CHUNG */}
      <Card className="pc-card pc-card-blue" title={<Space><InfoCircleOutlined className="pc-text-ocean"/><Text strong className="pc-text-ocean pc-font-16">Thông tin thiết lập chung</Text></Space>}>
        <Row gutter={24}>
          <Col xs={24} lg={12}><Form.Item name="Code" label="Mã quy chuẩn" rules={[{ required: true }]}><Input size="large" placeholder="VD: CFG-2026" /></Form.Item></Col>
          <Col xs={24} lg={12}><Form.Item name="Name" label="Tên gọi cấu hình" rules={[{ required: true }]}><Input size="large" placeholder="VD: Định mức quý 3" /></Form.Item></Col>
          <Col xs={24} lg={12}><Form.Item name="EffectiveDate" label="Ngày bắt đầu hiệu lực" rules={[{ required: true }]}><DatePicker size="large" className="pc-w-100" format="DD/MM/YYYY" /></Form.Item></Col>
          <Col xs={24} lg={12}><Form.Item name="Status" label="Trạng thái" initialValue={1}><Select size="large" options={[{ value: 1, label: "Bản nháp" }, { value: 2, label: "Đang áp dụng" }, { value: 3, label: "Ngưng áp dụng" }]} className="pc-w-100" /></Form.Item></Col>
        </Row>
      </Card>

      {/* 2. CẤU HÌNH DANH MỤC SỬ DỤNG FORM.LIST */}
      <Card className="pc-card pc-card-green" title={<Space><SettingOutlined className="pc-text-ocean"/><Text strong className="pc-text-ocean pc-font-16">Quản lý danh mục & Định mức (Quota)</Text></Space>}>
        
        {/* Header giả lập Table bằng Grid */}
        <Row gutter={16} className="pc-mb-24">
          <Col span={7}><Text strong type="secondary">Danh mục áp dụng</Text></Col>
          <Col span={7}><Text strong type="secondary">Phòng/Đơn vị</Text></Col>
          <Col span={8}><Text strong type="secondary">Định mức cho phép</Text></Col>
          <Col span={2}></Col>
        </Row>

        <Form.List name="Categories">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty description="Chưa có cấu hình danh mục nào." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="top">
                  <Col span={7}>
                    <Form.Item {...restField} name={[name, 'CategoryId']} rules={[{ required: true, message: 'Bắt buộc' }]}>
                      <Select placeholder="Chọn danh mục" options={categories.map(c => ({ label: c.Name, value: c.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item {...restField} name={[name, 'DepartmentId']} rules={[{ required: true, message: 'Bắt buộc' }]}>
                      <Select placeholder="Chọn đơn vị" options={departments.map(d => ({ label: d.Name, value: d.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item {...restField} name={[name, 'AllowedQuota']} rules={[{ required: true, message: 'Bắt buộc' }]}>
                      <InputNumber className="pc-w-100" placeholder="VD: 50,000,000" formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                  </Col>
                </Row>
              ))}

              <Divider dashed className="pc-mt-16 pc-mb-16"/>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="pc-text-ocean">
                Bổ sung danh mục định mức
              </Button>
            </>
          )}
        </Form.List>
      </Card>

      {/* 3. CẤU HÌNH NGƯỜI DUYỆT KIỂM SOÁT (Cấp 2) */}
      <Card className="pc-card pc-card-purple" title={<Space><TeamOutlined className="pc-text-ocean"/><Text strong className="pc-text-ocean pc-font-16">Thiết lập nhân sự kiểm soát (Cấp duyệt 2)</Text></Space>}>
        
        <Row gutter={16} className="pc-mb-24">
          <Col span={7}><Text strong type="secondary">Phòng/Đơn vị</Text></Col>
          <Col span={15}><Text strong type="secondary">Tài khoản người kiểm soát</Text></Col>
          <Col span={2}></Col>
        </Row>

        <Form.List name="Approves">
          {(fields, { add, remove }) => (
            <>
              {fields.length === 0 && (
                <Empty description="Chưa phân bổ nhân sự kiểm soát." image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}

              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="top">
                  <Col span={7}>
                    <Form.Item {...restField} name={[name, 'DepartmentId']} rules={[{ required: true, message: 'Bắt buộc' }]}>
                      <Select placeholder="Chọn đơn vị" options={departments.map(d => ({ label: d.Name, value: d.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                    </Form.Item>
                  </Col>
                  <Col span={15}>
                    <Form.Item {...restField} name={[name, 'ApproverId']} rules={[{ required: true, message: 'Bắt buộc' }]}>
                      <Select placeholder="Chọn tài khoản kiểm soát" options={users.map(u => ({ label: u.UserName, value: u.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                  </Col>
                </Row>
              ))}

              <Divider dashed className="pc-mt-16 pc-mb-16"/>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="pc-text-ocean">
                Phân bổ nhân sự kiểm soát
              </Button>
            </>
          )}
        </Form.List>
      </Card>
    </Form>
  );
};