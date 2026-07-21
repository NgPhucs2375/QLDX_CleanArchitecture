import { Layout, Space } from "antd";
import { CurrentUser } from "./current-user";

export const Header = () => {
  const headerStyles: React.CSSProperties = {
    backgroundColor: "#ffffff",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
    position: "sticky",
    top: 0,
    zIndex: 999,
    borderBottom: "1px solid #e1e7ee",
    boxShadow: "0 2px 8px rgba(122, 157, 193, 0.05)"
  };

  return (
    <Layout.Header style={headerStyles}>
      <Space align="center" size="middle">
        <CurrentUser />
      </Space>
    </Layout.Header>
  );
};