import React from "react";
import {
  RegisterPageProps, RegisterFormTypes, useRouterType, useLink, useActiveAuthProvider,
  useTranslate, useRouterContext, useRegister,
} from "@refinedev/core";
import { bodyStyles, containerStyles, headStyles, layoutStyles, titleStyles } from "./styles";
import { Row, Col, Layout, Card, Typography, Form, Input, Button, LayoutProps, CardProps, FormProps, Divider, theme } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

type RegisterProps = RegisterPageProps<LayoutProps, CardProps, FormProps>;

export const RegisterPage: React.FC<RegisterProps> = ({
  providers, loginLink, wrapperProps, contentProps, formProps, hideForm,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<RegisterFormTypes>();
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const authProvider = useActiveAuthProvider();
  const { mutate: register, isLoading } = useRegister<RegisterFormTypes>({
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
              onClick={() => register({ providerName: provider.name })}
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
        <Typography.Title level={3} style={titleStyles}>Đăng Ký Tài Khoản</Typography.Title>
        <Typography.Text type="secondary" style={{ color: "#6b7c93" }}>Tham gia hệ thống quản trị nội bộ</Typography.Text>
      </div>

      {renderProviders()}
      {!hideForm && (
        <Form<RegisterFormTypes>
          layout="vertical"
          form={form}
          onFinish={(values) => register(values)}
          requiredMark={false}
          {...formProps}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: translate("pages.register.errors.requiredEmail", "Vui lòng nhập Email!") },
              { type: "email", message: translate("pages.register.errors.validEmail", "Địa chỉ email không hợp lệ!") },
            ]}
          >
            <Input size="large" prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />} placeholder={translate("pages.register.fields.email", "Email")} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: translate("pages.register.errors.requiredPassword", "Vui lòng nhập Mật khẩu!") }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" size="large" htmlType="submit" loading={isLoading} block style={{ background: "#7a9dc1", borderColor: "#7a9dc1", fontWeight: 600, borderRadius: 6 }}>
              {translate("pages.register.buttons.submit", "Đăng Ký")}
            </Button>
          </Form.Item>
        </Form>
      )}
      {loginLink ?? (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Typography.Text style={{ fontSize: 14, color: "#6b7c93" }}>
            {translate("pages.login.buttons.haveAccount", "Đã có tài khoản?")}{" "}
            <ActiveLink style={{ fontWeight: "bold", color: "#7a9dc1" }} to="/login">
              {translate("pages.login.signin", "Đăng nhập ngay")}
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