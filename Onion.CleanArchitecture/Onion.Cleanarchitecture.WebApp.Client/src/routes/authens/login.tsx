import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Layout, theme } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();
  const { token } = theme.useToken();

  const onFinish = (values: any) => {
    login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Layout style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)" }}>
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(122, 157, 193, 0.15)",
          border: "1px solid #e1e7ee",
        }}
        bodyStyle={{ padding: "40px 32px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img 
            src="https://static.vietbank.com.vn/web/vietbank-logo.png" 
            alt="Vietbank Logo" 
            style={{ width: 64, height: 64, marginBottom: 16 }} 
          />
          <Title level={3} style={{ margin: 0, color: "#476481", fontWeight: 700 }}>
            Đăng Nhập Quản Trị
          </Title>
          <Text type="secondary" style={{ color: "#6b7c93" }}>
            Hệ thống Quản lý Đề xuất & Thông tin
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ email: "basicuser@gmail.com", password: "123Pa$$word!" }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
          >
            <Input 
              size="large" 
              prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />} 
              placeholder="Email của bạn" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password 
              size="large" 
              prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} 
              placeholder="Mật khẩu" 
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              block
              style={{
                background: "#7a9dc1",
                borderColor: "#7a9dc1",
                fontWeight: 600,
                borderRadius: 6,
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};