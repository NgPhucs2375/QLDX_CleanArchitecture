import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { ICreateUser } from "./types";
import { Form, Input, Row, Col, Select, Checkbox, Avatar, Card, Typography, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const CreateUser = () => {
  const { formProps, saveButtonProps } = useForm<ICreateUser>({
    redirect: "edit",
  });

  const { selectProps } = useSelect({
    resource: "roles",
    optionLabel: "Name",
    optionValue: "Id",
  });

  return (
    <Create 
      title={<span style={{ color: "#0f766e", fontWeight: 700, fontSize: 20 }}>Thêm Mới Người Dùng</span>}
      saveButtonProps={{ ...saveButtonProps, style: { background: "#0d9488", borderColor: "#0d9488" } }}
    >
      <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(13,148,136,0.05)", borderRadius: 8 }}>
        <Form {...formProps} layout="vertical">
          <Row gutter={32}>
            {/* Cột trái: Avatar và Trạng thái */}
            <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: 24, background: '#f0fdfa', borderRadius: 12, border: '1px dashed #5eead4', width: '100%', textAlign: 'center' }}>
                <Avatar
                  size={160}
                  icon={<UserOutlined />}
                  style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(13,148,136,0.1)' }}
                />
                <Divider style={{ margin: '16px 0', borderColor: '#ccfbf1' }} />
                
                <Form.Item name="EmailConfirmed" valuePropName="checked" style={{ marginTop: 24, marginBottom: 0 }}>
                  <Checkbox><Text strong style={{ color: '#0f766e' }}>Kích hoạt tài khoản</Text></Checkbox>
                </Form.Item>
              </div>
            </Col>

            {/* Cột phải: Form nhập liệu */}
            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Tên đăng nhập (UserName)</Text>}
                    name="UserName"
                    rules={[{ required: true, message: "Vui lòng nhập Tên đăng nhập!" }]}
                  >
                     <Input size="large" placeholder="Nhập username hệ thống..." />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Nhóm Quyền (Role)</Text>}
                    name="RoleId"
                    rules={[{ required: true, message: "Vui lòng chọn Quyền!" }]}
                  >
                    <Select size="large" placeholder="Chọn vai trò..." {...selectProps} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Họ (First Name)</Text>}
                    name="FirstName"
                    rules={[{ required: true, message: "Trường này bắt buộc!" }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Tên (Last Name)</Text>}
                    name="LastName"
                    rules={[{ required: true, message: "Trường này bắt buộc!" }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Địa chỉ Email</Text>}
                    name="Email"
                    rules={[
                      { type: "email", message: "Email không hợp lệ!" },
                      { required: true, message: "Vui lòng nhập Email!" },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Mật khẩu</Text>}
                    name="Password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" }
                    ]}
                  >
                    <Input.Password size="large" placeholder="Nhập mật khẩu..." />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#0f766e' }}>Xác nhận Mật khẩu</Text>}
                    name="ConfirmPassword"
                    dependencies={['Password']}
                    rules={[
                      { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('Password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" placeholder="Xác nhận mật khẩu..." />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>
    </Create>
  );
};