import React from "react";
import {
  ForgotPasswordPageProps, ForgotPasswordFormTypes, useRouterType, useLink,
  useTranslate, useRouterContext, useForgotPassword,
} from "@refinedev/core";
import { bodyStyles, containerStyles, headStyles, layoutStyles, titleStyles } from "./styles";
import { Row, Col, Layout, Card, Typography, Form, Input, Button, LayoutProps, CardProps, FormProps, theme } from "antd";
import { MailOutlined } from "@ant-design/icons";

type ResetPassworProps = ForgotPasswordPageProps<LayoutProps, CardProps, FormProps>;

export const ForgotPasswordPage: React.FC<ResetPassworProps> = ({
  loginLink, wrapperProps, contentProps, formProps,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<ForgotPasswordFormTypes>();
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const { mutate: forgotPassword, isLoading } = useForgotPassword<ForgotPasswordFormTypes>();

  const CardContent = (
    <Card
      headStyle={headStyles}
      bodyStyle={bodyStyles}
      style={{ ...containerStyles, backgroundColor: token.colorBgElevated }}
      {...(contentProps ?? {})}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src="https://static.vietbank.com.vn/web/vietbank-logo.png" alt="Vietbank Logo" style={{ width: 64, height: 64, marginBottom: 16 }} />
        <Typography.Title level={3} style={titleStyles}>
          {translate("pages.forgotPassword.title", "Quên Mật Khẩu?")}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ color: "#6b7c93" }}>
          Nhập email để nhận hướng dẫn khôi phục
        </Typography.Text>
      </div>

      <Form<ForgotPasswordFormTypes>
        layout="vertical"
        form={form}
        onFinish={(values) => forgotPassword(values)}
        requiredMark={false}
        {...formProps}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: translate("pages.forgotPassword.errors.requiredEmail", "Vui lòng nhập Email!") },
            { type: "email", message: translate("pages.forgotPassword.errors.validEmail", "Địa chỉ email không hợp lệ!") },
          ]}
        >
          <Input size="large" prefix={<MailOutlined style={{ color: token.colorTextQuaternary }} />} placeholder={translate("pages.forgotPassword.fields.email", "Email của bạn")} />
        </Form.Item>
        
        <Form.Item style={{ marginTop: "24px", marginBottom: 16 }}>
          <Button type="primary" size="large" htmlType="submit" loading={isLoading} block style={{ background: "#7a9dc1", borderColor: "#7a9dc1", fontWeight: 600, borderRadius: 6 }}>
            {translate("pages.forgotPassword.buttons.submit", "Gửi Hướng Dẫn")}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          {loginLink ?? (
            <Typography.Text style={{ fontSize: 14, color: "#6b7c93" }}>
              {translate("pages.register.buttons.haveAccount", "Nhớ ra mật khẩu? ")}{" "}
              <ActiveLink style={{ fontWeight: "bold", color: "#7a9dc1" }} to="/login">
                {translate("pages.login.signin", "Đăng nhập")}
              </ActiveLink>
            </Typography.Text>
          )}
        </div>
      </Form>
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