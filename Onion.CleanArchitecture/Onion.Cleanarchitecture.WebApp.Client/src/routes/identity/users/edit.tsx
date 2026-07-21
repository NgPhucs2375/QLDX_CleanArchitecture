import React, { useEffect } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { IUser, IUserAvatar } from "./types";
import { Avatar, Checkbox, Col, Form, Input, Row, Select, Card, Typography, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { AvatarProps } from "@components/upload-avatar";

const { Text } = Typography;

export const EditUser = () => {
  const [urlAvatar, setUrlAvatar] = React.useState<AvatarProps>();
  const { formProps, saveButtonProps } = useForm<IUser>({
    redirect: "list",
  });

  useEffect(() => {
    const avatarUrl = formProps.form?.getFieldValue("Avatar") as IUserAvatar;
    if (avatarUrl) {
      setUrlAvatar({ PublicId: avatarUrl?.AvatarUid, Url: avatarUrl?.AvatarUrl });
    }
  }, [formProps.form]);

  const { selectProps } = useSelect({
    resource: "roles",
    optionLabel: "Name",
    optionValue: "Id",
  });

  return (
    <Edit 
      title={<span style={{ color: "#476481", fontWeight: 700, fontSize: 20 }}>Cập Nhật Người Dùng</span>}
      saveButtonProps={{ ...saveButtonProps, style: { background: "#7a9dc1", borderColor: "#7a9dc1" } }}
    >
      <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(122,157,193,0.05)", borderRadius: 8 }}>
        <Form {...formProps} layout="vertical">
          <Form.Item label="Id" name="Id" hidden><Input /></Form.Item>

          <Row gutter={32}>
            <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ padding: 24, background: '#f4f7fa', borderRadius: 12, border: '1px dashed #d3dfea', width: '100%', textAlign: 'center' }}>
                  <Avatar
                    size={160}
                    icon={<UserOutlined />}
                    src={`https://documents.vietbank.com.vn/avatar/${formProps.form?.getFieldValue("Email")}.jpg`}
                    style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Divider style={{ margin: '16px 0' }} />
                  
                  <Form.Item name="EmailConfirmed" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox><Text strong style={{ color: '#476481' }}>Tài khoản Đang hoạt động</Text></Checkbox>
                  </Form.Item>
               </div>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Tài khoản LDAP</Text>}
                    name="UserName"
                    rules={[{ required: true, message: "Bắt buộc nhập tài khoản!" }]}
                  >
                    <Input size="large" readOnly disabled style={{ background: '#f8fafc', color: '#6b7c93' }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label={<Text strong style={{ color: '#476481' }}>Phân Quyền (Role)</Text>}
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
                    label={<Text strong style={{ color: '#476481' }}>Địa chỉ Email</Text>}
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
    </Edit>
  );
};