import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Row, Col, Typography, Card, Space, Button } from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { IProduct } from "./types";
import "../../assets/product.css";

const { Title, Text } = Typography;

export const EditProduct = () => {
  const { formProps, saveButtonProps } = useForm<IProduct>({ redirect: "show" });
  const { selectProps: categorySelectProps } = useSelect({ resource: "categories", optionLabel: "Name", optionValue: "Id" });

  return (
    <Edit 
      title={<Title level={3} className="pd-m-0 pd-text-ocean pd-font-bold">Cập nhật sản phẩm</Title>}
      footerButtons={
        <Button type="primary" {...saveButtonProps} size="large" icon={<SaveOutlined />} className="pd-btn-primary">
          Lưu thay đổi
        </Button>
      }
    >
      <Form {...formProps} layout="vertical">
        {/* TRƯỜNG ID BẮT BUỘC PHẢI CÓ ĐỂ UPDATE KHÔNG BỊ LỖI */}
        <Form.Item name="Id" hidden><Input /></Form.Item>
        
        <Card 
            className="pd-card pd-card-ocean" 
            title={<Space><EditOutlined className="pd-text-ocean" /><Text strong className="pd-text-ocean pd-font-16">Thông tin chi tiết sản phẩm</Text></Space>}
        >
          <Row gutter={32}>
            <Col xs={24} lg={12}>
              <Form.Item label="Mã sản phẩm" name="Code" rules={[{ required: true, message: "Vui lòng nhập mã SP!" }, { max: 50 }]}>
                <Input size="large" placeholder="VD: SP-001" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label="Tên sản phẩm" name="Name" rules={[{ required: true, message: "Vui lòng nhập tên SP!" }, { max: 255 }]}>
                <Input size="large" placeholder="Nhập tên sản phẩm..." />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label="Danh mục áp dụng" name="CategoryId" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}>
                <Select size="large" {...categorySelectProps} placeholder="Chọn danh mục..." showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={6}>
              <Form.Item label="Đơn giá (VNĐ)" name="UnitPrice" rules={[{ required: true, message: "Vui lòng nhập đơn giá!" }]}>
                <InputNumber size="large" className="pd-w-100" min={0} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={6}>
              <Form.Item label="Đơn vị tính" name="Unit" rules={[{ required: true, message: "Vui lòng nhập ĐVT!" }]}>
                <Input size="large" placeholder="VD: Cái, Hộp, Cuộn..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Trạng thái kinh doanh" name="IsActive" valuePropName="checked">
                <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng kinh doanh" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Edit>
  );
};