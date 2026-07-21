import React from "react";
import {
  LoginPageProps, useLink, useRouterType, useActiveAuthProvider,
  useLogin, useTranslate, useRouterContext,
} from "@refinedev/core";
import { bodyStyles, containerStyles, headStyles, layoutStyles, titleStyles } from "./styles";
import { Row, Col, Layout, Card, Typography, Form, Input, Button, Checkbox, CardProps, LayoutProps, Divider, FormProps, theme } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

export interface LoginFormTypes {
  email?: string;
  password?: string;
  remember?: boolean;
  providerName?: string;
  redirectPath?: string;
}

type LoginProps = LoginPageProps<LayoutProps, CardProps, FormProps>;

export const LoginPage: React.FC<LoginProps> = ({
  providers, registerLink, forgotPasswordLink, rememberMe, contentProps, wrapperProps, formProps, hideForm,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<LoginFormTypes>();
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const authProvider = useActiveAuthProvider();
  const { mutate: login, isLoading } = useLogin<LoginFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const renderProviders = () => {
    if (providers && providers.length > 0) {
      return (
        <>
          {providers.map((provider) => (
            <Button
              key={provider.name}
              type="default"
              block
              icon={provider.icon}
              style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginBottom: "8px" }}
              onClick={() => login({ providerName: provider.name })}
            >
              {provider.label}
            </Button>
          ))}
          {!hideForm && (
            <Divider><Typography.Text style={{ color: token.colorTextLabel }}>{translate("pages.login.divider", "hoặc")}</Typography.Text></Divider>
          )}
        </>
      );
    }
    return null;
  };

  const CardContent = (
    <Card
      headStyle={headStyles}
      bodyStyle={bodyStyles}
      style={{ ...containerStyles, backgroundColor: token.colorBgElevated }}
      {...(contentProps ?? {})}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src="https://static.vietbank.com.vn/web/vietbank-logo.png" alt="Vietbank Logo" style={{ width: 64, height: 64, marginBottom: 16 }} />
        <Typography.Title level={3} style={titleStyles}>Đăng Nhập Quản Trị</Typography.Title>
        <Typography.Text type="secondary" style={{ color: "#6b7c93" }}>Hệ thống Quản lý Đề xuất & Thông tin</Typography.Text>
      </div>

      {renderProviders()}
      {!hideForm && (
        <Form<LoginFormTypes>
          layout="vertical"
          form={form}
          onFinish={(values) => login(values)}
          requiredMark={false}
          initialValues={{ remember: false, email: "basicuser@gmail.com", password: "123Pa$$word!" }}
          {...formProps}
        >
          <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập Email!" }]}>
            <Input size="large" prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Email của bạn" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}>
            <Input.Password size="large" prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Mật khẩu" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            {rememberMe ?? (
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ fontSize: "14px", color: "#6b7c93" }}>{translate("pages.login.buttons.rememberMe", "Ghi nhớ tôi")}</Checkbox>
              </Form.Item>
            )}
            {forgotPasswordLink ?? (
              <ActiveLink style={{ color: "#7a9dc1", fontSize: "14px", marginLeft: "auto", fontWeight: 500 }} to="/forgot-password">
                {translate("pages.login.buttons.forgotPassword", "Quên mật khẩu?")}
              </ActiveLink>
            )}
          </div>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" size="large" htmlType="submit" loading={isLoading} block style={{ background: "#7a9dc1", borderColor: "#7a9dc1", fontWeight: 600, borderRadius: 6 }}>
              {translate("pages.login.signin", "Đăng Nhập")}
            </Button>
          </Form.Item>
        </Form>
      )}

      {registerLink ?? (
        <div style={{ marginTop: hideForm ? 16 : 16, textAlign: "center" }}>
          <Typography.Text style={{ fontSize: 14, color: "#6b7c93" }}>
            {translate("pages.login.buttons.noAccount", "Chưa có tài khoản?")}{" "}
            <ActiveLink to="/register" style={{ fontWeight: "bold", color: "#7a9dc1" }}>
              {translate("pages.login.signup", "Đăng ký ngay")}
            </ActiveLink>
          </Typography.Text>
        </div>
      )}
    </Card>
  );

  return (
    <Layout style={layoutStyles} {...(wrapperProps ?? {})}>
      <Row justify="center" align="middle" style={{ width: "100%" }}>
        <Col>{CardContent}</Col>
      </Row>
    </Layout>
  );
};