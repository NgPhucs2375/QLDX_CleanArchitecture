import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { ICreateUser } from "./types";
import { Form, Input, Row, Col, Select, Checkbox, Card, Typography, Avatar, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const CloneUser = () => {
  const { formProps, saveButtonProps, queryResult } = useForm<ICreateUser>({
    action: "clone",
    redirect: "list",
  });

  const { selectProps } = useSelect({
    resource: "roles",
    optionLabel: "Name",
    optionValue: "Id",
  });

  const recordEmail = queryResult?.data?.data?.Email;

  return (
    <Create 
      title={<span style={{ color: "#476481", fontWeight: 700, fontSize: 20 }}>Nhân Bản Người Dùng</span>}
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
                  src={recordEmail ? `https://documents.vietbank.com.vn/avatar/${recordEmail}.jpg` : undefined}
                  style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Divider style={{ margin: '16px 0' }} />
                
                <Form.Item name="EmailConfirmed" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox><Text strong style={{ color: '#476481' }}>Kích hoạt tài khoản</Text></Checkbox>
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Tài khoản LDAP (Mới)</Text>}
                    name="UserName"
                    rules={[{ required: true, message: "Vui lòng nhập Tài khoản!" }]}
                  >
                     <Input size="large" placeholder="Nhập tài khoản LDAP mới..." />
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
                    label={<Text strong style={{ color: '#476481' }}>Họ</Text>}
                    name="FirstName"
                    rules={[{ required: true, message: "Vui lòng nhập Họ!" }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Tên</Text>}
                    name="LastName"
                    rules={[{ required: true, message: "Vui lòng nhập Tên!" }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Địa chỉ Email (Mới)</Text>}
                    name="Email"
                    rules={[
                      { type: "email", message: "Email không hợp lệ!" },
                      { required: true, message: "Vui lòng nhập Email!" },
                    ]}
                  >
                    <Input size="large" />
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