import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Layout } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin();

  const onFinish = (values: any) => {
    login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Layout style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      // Cải tiến nền: Dùng radial-gradient tạo chiều sâu và độ sáng
      background: "radial-gradient(circle at 0% 0%, #ccfbf1 0%, #f8fafc 50%, #e0f2fe 100%)" 
    }}>
      <Card
        style={{
          width: 440,
          borderRadius: 24, // Bo góc mềm mại hơn
          // Cải tiến Card: Hiệu ứng kính (Glassmorphism)
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)", // Hỗ trợ Safari
          boxShadow: "0 25px 50px -12px rgba(13, 148, 136, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
        bodyStyle={{ padding: "48px 40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {/* Vòng tròn nổi bật bọc quanh Logo */}
          <div style={{ 
            background: "#ffffff", 
            width: 88, 
            height: 88, 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 20px",
            boxShadow: "0 10px 25px rgba(13, 148, 136, 0.12)"
          }}>
            <img 
              src="https://static.vietbank.com.vn/web/vietbank-logo.png" 
              alt="Vietbank Logo" 
              style={{ width: 60, height: 60, objectFit: "contain" }} 
            />
          </div>
          <Title level={3} style={{ margin: 0, color: "#0f766e", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Đăng Nhập Quản Trị
          </Title>
          <Text style={{ color: "#64748b", fontSize: 15, marginTop: 8, display: "block" }}>
            Hệ thống Quản lý Đề xuất & Thông tin
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ email: "basicuser@gmail.com", password: "123Pa$$word!" }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: "#0d9488", marginRight: 8, fontSize: 18 }} />} 
              placeholder="Email của bạn" 
              style={{ 
                borderRadius: 12, 
                padding: "12px 16px", 
                background: "#ffffff", 
                border: "1px solid #e2e8f0",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: "#0d9488", marginRight: 8, fontSize: 18 }} />} 
              placeholder="Mật khẩu" 
              style={{ 
                borderRadius: 12, 
                padding: "12px 16px", 
                background: "#ffffff", 
                border: "1px solid #e2e8f0",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                // Nút bấm dùng dải màu Gradient nổi bật
                background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                border: "none",
                height: 52,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                boxShadow: "0 10px 20px rgba(13, 148, 136, 0.25)",
                transition: "all 0.3s ease"
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