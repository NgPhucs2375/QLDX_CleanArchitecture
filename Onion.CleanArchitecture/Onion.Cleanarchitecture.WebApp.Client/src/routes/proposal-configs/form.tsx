import { Form, Input, DatePicker, Select, Button, Space, Typography, Row, Col, Card, Empty, InputNumber, Tooltip, Alert, Flex, Table } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, SettingOutlined, TeamOutlined, QuestionCircleOutlined } from "@ant-design/icons";
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
  const { onFinish, form } = formProps;
  
  const { queryResult: userQueryResult } = useSelect<IUser>({ resource: "users", optionLabel: "UserName", optionValue: "Id", pagination: { mode: "off" } });
  const users = useMemo(() => userQueryResult.data?.data ?? [], [userQueryResult.data]);

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
      <Flex vertical gap="large" className="pc-w-100">
        
        {/* 1. THÔNG TIN CHUNG */}
        <Card className="pc-card pc-card-ocean" title={<Space><InfoCircleOutlined className="pc-text-ocean"/><Text strong className="pc-text-ocean pc-font-16">Thông tin thiết lập chung</Text></Space>}>
          <Row gutter={24}>
            <Col xs={24} lg={12}>
                <Form.Item name="Code" label="Mã quy chuẩn" rules={[{ required: true }]}>
                    <Input size="large" placeholder="VD: CFG-2026" />
                </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
                <Form.Item name="Name" label="Tên gọi cấu hình" rules={[{ required: true }]}>
                    <Input size="large" placeholder="VD: Định mức quý 3" />
                </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
                <Form.Item name="EffectiveDate" label="Ngày bắt đầu hiệu lực" rules={[{ required: true }]}>
                    <DatePicker size="large" className="pc-w-100" format="DD/MM/YYYY" />
                </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
                <Form.Item name="Status" label="Trạng thái" initialValue={1}>
                    <Select size="large" options={[{ value: 1, label: "Bản nháp" }, { value: 2, label: "Đang áp dụng" }, { value: 3, label: "Ngưng áp dụng" }]} className="pc-w-100" />
                </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 2. CẤU HÌNH DANH MỤC KẾT HỢP TABLE */}
        <Card className="pc-card pc-card-ocean" title={<Space><SettingOutlined className="pc-text-ocean"/><Text strong className="pc-text-ocean pc-font-16">Quản lý danh mục & Định mức (Quota)</Text></Space>}>
          <Alert 
            showIcon 
            type="info" 
            icon={<QuestionCircleOutlined />}
            message="Thiết lập hạn mức chi tiêu tối đa cho từng danh mục tương ứng với mỗi đơn vị/phòng ban." 
            style={{ marginBottom: 16 }}
          />

          <Form.List name="Categories">
            {(fields, { add, remove }) => (
              <Flex vertical gap="middle">
                <Table 
                    dataSource={fields} 
                    rowKey="key" 
                    pagination={false} 
                    size="small"
                    bordered
                    locale={{ emptyText: <Empty description="Chưa có cấu hình danh mục nào." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    columns={[
                        {
                            title: "Danh mục áp dụng",
                            dataIndex: "name",
                            width: "35%",
                            render: (name) => (
                                <Form.Item name={[name, 'CategoryId']} rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                                    <Select placeholder="Chọn danh mục" options={categories.map(c => ({ label: c.Name, value: c.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                                </Form.Item>
                            )
                        },
                        {
                            title: "Phòng/Đơn vị",
                            dataIndex: "name",
                            width: "35%",
                            render: (name) => (
                                <Form.Item name={[name, 'DepartmentId']} rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                                    <Select placeholder="Chọn đơn vị" options={departments.map(d => ({ label: d.Name, value: d.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                                </Form.Item>
                            )
                        },
                        {
                            title: "Định mức cho phép",
                            dataIndex: "name",
                            width: "25%",
                            align: "right",
                            render: (name) => (
                                <Form.Item name={[name, 'AllowedQuota']} rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                                    <InputNumber className="pc-w-100" placeholder="VD: 50,000,000" formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} min={0} />
                                </Form.Item>
                            )
                        },
                        {
                            title: "",
                            dataIndex: "name",
                            width: "5%",
                            align: "center",
                            render: (name) => (
                                <Tooltip title="Xóa định mức này">
                                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                </Tooltip>
                            )
                        }
                    ]}
                />
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="pc-text-ocean">
                  Bổ sung danh mục định mức
                </Button>
              </Flex>
            )}
          </Form.List>
        </Card>

        {/* 3. CẤU HÌNH NGƯỜI DUYỆT KẾT HỢP TABLE */}
        <Card className="pc-card pc-card-ocean" title={<Space><TeamOutlined className="pc-text-ocean"/><Text strong className="pc-text-ocean pc-font-16">Thiết lập nhân sự kiểm soát (Cấp duyệt 2)</Text></Space>}>
          <Alert 
            showIcon 
            type="info" 
            message="Chỉ định tài khoản chịu trách nhiệm kiểm soát đề xuất cho từng phòng ban (bước duyệt thứ 2)." 
            style={{ marginBottom: 16 }}
          />
          
          <Form.List name="Approves">
            {(fields, { add, remove }) => (
              <Flex vertical gap="middle">
                <Table 
                    dataSource={fields} 
                    rowKey="key" 
                    pagination={false} 
                    size="small"
                    bordered
                    locale={{ emptyText: <Empty description="Chưa phân bổ nhân sự kiểm soát." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    columns={[
                        {
                            title: "Phòng/Đơn vị",
                            dataIndex: "name",
                            width: "45%",
                            render: (name) => (
                                <Form.Item name={[name, 'DepartmentId']} rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                                    <Select placeholder="Chọn đơn vị" options={departments.map(d => ({ label: d.Name, value: d.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                                </Form.Item>
                            )
                        },
                        {
                            title: "Tài khoản người kiểm soát",
                            dataIndex: "name",
                            width: "50%",
                            render: (name) => (
                                <Form.Item name={[name, 'ApproverId']} rules={[{ required: true, message: 'Bắt buộc' }]} style={{ marginBottom: 0 }}>
                                    <Select placeholder="Chọn tài khoản kiểm soát" options={users.map(u => ({ label: u.UserName, value: u.Id }))} showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                                </Form.Item>
                            )
                        },
                        {
                            title: "",
                            dataIndex: "name",
                            width: "5%",
                            align: "center",
                            render: (name) => (
                                <Tooltip title="Gỡ nhân sự">
                                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                </Tooltip>
                            )
                        }
                    ]}
                />
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="pc-text-ocean">
                  Phân bổ nhân sự kiểm soát
                </Button>
              </Flex>
            )}
          </Form.List>
        </Card>
      </Flex>
    </Form>
  );
};