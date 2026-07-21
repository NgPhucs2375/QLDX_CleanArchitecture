import { Create, useForm } from "@refinedev/antd";
import { Role } from "./types";
import { Form, Input, Typography, Row, Col } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { RoleForm } from "./form";

const { Title } = Typography;

export const CloneRole = () => {
  const { formProps, saveButtonProps } = useForm<Role>({
    redirect: "list",
  });

  return (
    <Create
      resource="roles"
      title={<Title level={3} style={{ margin: 0, color: '#476481' }}>Nhân Bản Vai Trò</Title>}
      saveButtonProps={{ ...saveButtonProps, children: "Lưu Bản Sao", style: { background: '#7a9dc1', fontWeight: 600 } }}
    >
      <Form {...formProps} layout="vertical">
        <RoleForm>
          <div className="role-card">
            <div className="role-card-header">
              <div className="role-card-icon" style={{ background: '#fff1f0', color: '#f5222d' }}><CopyOutlined /></div>
              <h3>Thông tin vai trò hệ thống (Bản sao)</h3>
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
    </Create>
  );
};