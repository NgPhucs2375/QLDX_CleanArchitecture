import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Switch, Typography, Row, Col } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ICategory } from "./types";
import { CategoryForm } from "./form";

const { Title } = Typography;

export const EditCategory = () => {
  const { formProps, saveButtonProps } = useForm<ICategory>({
    redirect: "list",
  });

  return (
    <Edit 
      title={<Title level={3} style={{ margin: 0, color: '#476481' }}>Chỉnh Sửa Danh Mục</Title>}
      saveButtonProps={{ ...saveButtonProps, children: "Cập nhật", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <Form {...formProps} layout="vertical">
        <CategoryForm>
          <Form.Item name="Id" hidden><Input /></Form.Item>
          
          <div className="cat-card">
            <div className="cat-card-header">
              <div className="cat-card-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}><EditOutlined /></div>
              <h3>Cập nhật thông tin</h3>
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
                    <Input size="large" />
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
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Trạng thái hoạt động" name="IsActive" valuePropName="checked">
                    <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Ngừng hoạt động" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
        </CategoryForm>
      </Form>
    </Edit>
  );
};