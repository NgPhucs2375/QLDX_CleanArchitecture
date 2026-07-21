import { Edit, useForm } from "@refinedev/antd";
import { Role } from "./types";
import { Form, Input, Typography, Row, Col } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { RoleForm } from "./form";

const { Title } = Typography;

export const EditRole = () => {
  const { formProps, saveButtonProps } = useForm<Role>({
    redirect: "list",
  });

  return (
    <Edit 
      resource="roles" 
      title={<Title level={3} style={{ margin: 0, color: '#476481' }}>Chỉnh Sửa Vai Trò</Title>}
      saveButtonProps={{ ...saveButtonProps, children: "Cập Nhật", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <Form {...formProps} layout="vertical">
        <RoleForm>
          <Form.Item label="ID" name="Id" hidden><Input /></Form.Item>
          
          <div className="role-card">
            <div className="role-card-header">
              <div className="role-card-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}><EditOutlined /></div>
              <h3>Cập nhật thông tin vai trò</h3>
            </div>
            <div className="role-card-body">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Tên vai trò (Name)" 
                    name="Name"
                    rules={[{ required: true, message: "Vui lòng nhập tên vai trò!" }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
        </RoleForm>
      </Form>
    </Edit>
  );
};