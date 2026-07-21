import React from "react";
import {
  UpdatePasswordPageProps, UpdatePasswordFormTypes, useActiveAuthProvider,
  useTranslate, useUpdatePassword,
} from "@refinedev/core";
import { bodyStyles, containerStyles, headStyles, layoutStyles, titleStyles } from "./styles";
import { Row, Col, Layout, Card, Typography, Form, Input, Button, LayoutProps, CardProps, FormProps, theme } from "antd";
import { LockOutlined } from "@ant-design/icons";

type UpdatePasswordProps = UpdatePasswordPageProps<LayoutProps, CardProps, FormProps>;

export const UpdatePasswordPage: React.FC<UpdatePasswordProps> = ({
  wrapperProps, contentProps, formProps,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<UpdatePasswordFormTypes>();
  const translate = useTranslate();
  const authProvider = useActiveAuthProvider();
  const { mutate: updatePassword, isLoading } = useUpdatePassword<UpdatePasswordFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

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
          {translate("pages.updatePassword.title", "Thiết Lập Mật Khẩu Mới")}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ color: "#6b7c93" }}>
          Vui lòng nhập mật khẩu mới bảo mật
        </Typography.Text>
      </div>

      <Form<UpdatePasswordFormTypes>
        layout="vertical"
        form={form}
        onFinish={(values) => updatePassword(values)}
        requiredMark={false}
        {...formProps}
      >
        <Form.Item
          name="password"
          rules={[{ required: true, message: translate("pages.updatePassword.errors.requiredPassword", "Vui lòng nhập mật khẩu mới!") }]}
          style={{ marginBottom: "16px" }}
        >
          <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Mật khẩu mới" size="large" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          hasFeedback
          dependencies={["password"]}
          rules={[
            { required: true, message: translate("pages.updatePassword.errors.requiredConfirmPassword", "Vui lòng xác nhận lại mật khẩu!") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(translate("pages.updatePassword.errors.confirmPasswordNotMatch", "Mật khẩu không khớp!")));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Xác nhận mật khẩu mới" size="large" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button type="primary" size="large" htmlType="submit" loading={isLoading} block style={{ background: "#7a9dc1", borderColor: "#7a9dc1", fontWeight: 600, borderRadius: 6 }}>
            {translate("pages.updatePassword.buttons.submit", "Cập Nhật Mật Khẩu")}
          </Button>
        </Form.Item>
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