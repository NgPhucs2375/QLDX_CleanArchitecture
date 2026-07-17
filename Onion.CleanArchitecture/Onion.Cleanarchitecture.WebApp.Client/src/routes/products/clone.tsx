import { useForm, Create, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Row, Col, Typography } from "antd";
import { AppstoreAddOutlined } from "@ant-design/icons";
import { IProduct } from "./types";

const { Title } = Typography;

const STYLES = `
  .pearl-card { background: #ffffff; border: 1px solid #e1e7ee; border-radius: 8px; padding: 0 0 24px 0; box-shadow: 0 2px 10px rgba(122, 157, 193, 0.05); }
  .pearl-card-header { display: flex; align-items: center; gap: 10px; padding: 16px 24px; background: linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%); border-bottom: 1px solid #e1e7ee; margin-bottom: 24px; }
  .pearl-card-header h3 { font-size: 17px; font-weight: 700; margin: 0; color: #476481; }
  .pearl-form .ant-form-item-label > label { font-size: 15px; font-weight: 600; color: #3a4a5b; }
`;

export const CloneProduct = () => {
  const { formProps, saveButtonProps } = useForm<IProduct>({ redirect: "edit" });
  const { selectProps: categorySelectProps } = useSelect({ resource: "categories", optionLabel: "Name", optionValue: "Id" });

  return (
    <>
      <style>{STYLES}</style>
      <Create 
        title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Clone Thêm mới Sản phẩm</Title>}
        saveButtonProps={{ ...saveButtonProps, style: { background: '#7a9dc1', borderColor: '#7a9dc1', padding: '0 24px', height: 40, borderRadius: 6, fontWeight: 600 } }}
      >
        <Form {...formProps} layout="vertical" className="pearl-form">
          <div className="pearl-card">
            <div className="pearl-card-header">
              <div style={{ background: '#f0fdfa', color: '#0d9488', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><AppstoreAddOutlined /></div>
              <h3>Thông tin chi tiết sản phẩm</h3>
            </div>
            
            <div style={{ padding: '0 24px' }}>
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
                  <Form.Item label="Thuộc Danh mục" name="CategoryId" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}>
                    <Select size="large" {...categorySelectProps} placeholder="Chọn danh mục..." showSearch filterOption={(input, option) => (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item label="Đơn giá (VNĐ)" name="UnitPrice" rules={[{ required: true, message: "Vui lòng nhập đơn giá!" }]}>
                    <InputNumber size="large" style={{ width: "100%" }} min={0} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item label="Đơn vị tính (ĐVT)" name="Unit" rules={[{ required: true, message: "Vui lòng nhập ĐVT!" }]}>
                    <Input size="large" placeholder="VD: Cái, Hộp, Cuộn..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Trạng thái kinh doanh" name="IsActive" valuePropName="checked" initialValue={true}>
                    <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng kinh doanh" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
        </Form>
      </Create>
    </>
  );
};