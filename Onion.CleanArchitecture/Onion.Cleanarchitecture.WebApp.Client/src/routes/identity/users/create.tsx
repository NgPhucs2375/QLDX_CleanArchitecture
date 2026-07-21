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

  // Đã xóa hàm handleGetUserLdap và state urlAvatar vì không còn dùng LDAP nữa

  return (
    <Create 
      title={<span style={{ color: "#476481", fontWeight: 700, fontSize: 20 }}>Thêm Mới Người Dùng</span>}
      saveButtonProps={{ ...saveButtonProps, style: { background: "#7a9dc1", borderColor: "#7a9dc1" } }}
    >
      <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(122,157,193,0.05)", borderRadius: 8 }}>
        <Form {...formProps} layout="vertical">
          <Row gutter={32}>
            <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: 24, background: '#f4f7fa', borderRadius: 12, border: '1px dashed #d3dfea', width: '100%', textAlign: 'center' }}>
                <Avatar
                  size={160}
                  icon={<UserOutlined />}
                  style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Divider style={{ margin: '16px 0' }} />
                
                <Form.Item name="EmailConfirmed" valuePropName="checked" style={{ marginTop: 24, marginBottom: 0 }}>
                  <Checkbox><Text strong style={{ color: '#476481' }}>Kích hoạt tài khoản</Text></Checkbox>
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Tên đăng nhập (UserName)</Text>}
                    name="UserName"
                    rules={[{ required: true, message: "Vui lòng nhập Tên đăng nhập!" }]}
                  >
                     {/* Đã xóa nút Kiểm tra LDAP và thay bằng Input thường */}
                     <Input size="large" placeholder="Nhập username hệ thống..." />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Nhóm Quyền (Role)</Text>}
                    name="RoleId"
                    rules={[{ required: true, message: "Vui lòng chọn Quyền!" }]}
                  >
                    <Select size="large" placeholder="Chọn vai trò..." {...selectProps} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Họ (First Name)</Text>}
                    name="FirstName"
                    rules={[{ required: true, message: "Trường này bắt buộc!" }]}
                  >
                    {/* Đã gỡ bỏ thuộc tính readOnly */}
                    <Input size="large" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Tên (Last Name)</Text>}
                    name="LastName"
                    rules={[{ required: true, message: "Trường này bắt buộc!" }]}
                  >
                    {/* Đã gỡ bỏ thuộc tính readOnly */}
                    <Input size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Địa chỉ Email</Text>}
                    name="Email"
                    rules={[
                      { type: "email", message: "Email không hợp lệ!" },
                      { required: true, message: "Vui lòng nhập Email!" },
                    ]}
                  >
                    {/* Đã gỡ bỏ thuộc tính readOnly */}
                    <Input size="large" />
                  </Form.Item>
                </Col>

                {/* BỔ SUNG: 2 trường Mật khẩu cho tài khoản nội bộ */}
                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Mật khẩu</Text>}
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
                    label={<Text strong style={{ color: '#476481' }}>Xác nhận Mật khẩu</Text>}
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