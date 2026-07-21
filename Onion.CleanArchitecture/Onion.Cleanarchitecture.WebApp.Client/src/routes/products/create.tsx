import React from "react";
import { useForm, Create, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Row, Col, Typography, Card } from "antd";
import { AppstoreAddOutlined } from "@ant-design/icons";
import { IProduct } from "./types";

const { Title, Text } = Typography;

export const CreateProduct = () => {
  const { formProps, saveButtonProps } = useForm<IProduct>({ redirect: "edit" });
  const { selectProps: categorySelectProps } = useSelect({ resource: "categories", optionLabel: "Name", optionValue: "Id" });

  return (
    <Create 
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Thêm Sản phẩm</Title>}
      saveButtonProps={{ ...saveButtonProps, style: { background: '#7a9dc1', borderColor: '#7a9dc1', borderRadius: 6, fontWeight: 600 } }}
    >
      <Form {...formProps} layout="vertical">
        <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(122,157,193,0.05)", borderRadius: 8 }}>
          <div style={{ background: "linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)", padding: "16px 24px", margin: "-24px -24px 24px -24px", borderBottom: "1px solid #e1e7ee", display: "flex", alignItems: "center", gap: 12, borderRadius: "8px 8px 0 0" }}>
            <div style={{ background: '#f0fdfa', color: '#0d9488', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <AppstoreAddOutlined />
            </div>
            <Title level={5} style={{ margin: 0, color: '#476481' }}>Thông tin chi tiết sản phẩm</Title>
          </div>
          
          <Row gutter={32}>
            <Col xs={24} lg={12}>
              <Form.Item label={<Text strong style={{ color: '#476481' }}>Mã sản phẩm</Text>} name="Code" rules={[{ required: true, message: "Vui lòng nhập mã SP!" }, { max: 50 }]}>
                <Input size="large" placeholder="VD: SP-001" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label={<Text strong style={{ color: '#476481' }}>Tên sản phẩm</Text>} name="Name" rules={[{ required: true, message: "Vui lòng nhập tên SP!" }, { max: 255 }]}>
                <Input size="large" placeholder="Nhập tên sản phẩm..." />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label={<Text strong style={{ color: '#476481' }}>Thuộc Danh mục</Text>} name="CategoryId" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}>
                <Select size="large" {...categorySelectProps} placeholder="Chọn danh mục..." showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={6}>
              <Form.Item label={<Text strong style={{ color: '#476481' }}>Đơn giá (VNĐ)</Text>} name="UnitPrice" rules={[{ required: true, message: "Vui lòng nhập đơn giá!" }]}>
                <InputNumber size="large" style={{ width: "100%" }} min={0} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={6}>
              <Form.Item label={<Text strong style={{ color: '#476481' }}>Đơn vị tính (ĐVT)</Text>} name="Unit" rules={[{ required: true, message: "Vui lòng nhập ĐVT!" }]}>
                <Input size="large" placeholder="VD: Cái, Hộp, Cuộn..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label={<Text strong style={{ color: '#476481' }}>Trạng thái kinh doanh</Text>} name="IsActive" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng kinh doanh" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Create>
  );
};