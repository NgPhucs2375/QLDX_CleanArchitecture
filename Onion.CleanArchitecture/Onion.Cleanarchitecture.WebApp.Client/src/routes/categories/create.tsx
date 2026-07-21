import { useForm, Create } from "@refinedev/antd";
import { Form, Input, Switch, Typography, Row, Col } from "antd";
import { AppstoreAddOutlined } from "@ant-design/icons";
import { ICategory } from "./types";
import { CategoryForm } from "./form";

const { Title } = Typography;

export const CreateCategory = () => {
  const { formProps, saveButtonProps } = useForm<ICategory>({
    redirect: "list",
  });

  return (
    <Create 
      title={<Title level={3} style={{ margin: 0, color: '#476481' }}>Thêm Mới Danh Mục</Title>}
      saveButtonProps={{ ...saveButtonProps, children: "Lưu Danh Mục", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <Form {...formProps} layout="vertical">
        <CategoryForm>
          <div className="cat-card">
            <div className="cat-card-header">
              <div className="cat-card-icon"><AppstoreAddOutlined /></div>
              <h3>Thông tin danh mục</h3>
            </div>
            <div className="cat-card-body">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Mã danh mục"
                    name="Code"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã danh mục!" },
                      { max: 50, message: "Mã không được vượt quá 50 ký tự!" },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập mã danh mục (VD: VPP)..." />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tên danh mục"
                    name="Name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên danh mục!" },
                      { max: 200, message: "Tên không được vượt quá 200 ký tự!" },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập tên danh mục (VD: Văn phòng phẩm)..." />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Trạng thái hoạt động" name="IsActive" valuePropName="checked" initialValue={true}>
                    <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
        </CategoryForm>
      </Form>
    </Create>
  );
};