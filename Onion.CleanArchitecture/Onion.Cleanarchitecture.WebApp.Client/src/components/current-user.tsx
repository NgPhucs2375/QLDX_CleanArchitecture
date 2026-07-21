import { useGetIdentity, useLogout } from "@refinedev/core";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Popover } from "antd";
import { CustomAvatar } from "./custom-avatar";
import { Text } from "./text";
import { IUserByMe } from "@routes/identity/users";

export const CurrentUser: React.FC = () => {
  const { data: user } = useGetIdentity<IUserByMe>();
  const { mutate: logout } = useLogout();
  
  const content = (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 240 }}>
      {/* Header của Popover */}
      <div style={{ 
        padding: "16px 20px", 
        background: "linear-gradient(135deg, #f4f7fa 0%, #e6edf4 100%)", 
        borderBottom: "1px solid #e1e7ee",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      }}>
        <CustomAvatar name={user?.Fullname || user?.Name} src={user?.AvatarUrl} size="large" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text strong style={{ color: "#476481", fontSize: 15, lineHeight: 1.2 }}>
            {user?.Fullname || user?.Name || "Quản trị viên"}
          </Text>
          <Text style={{ color: "#6b7c93", fontSize: 13 }}>
            {user?.Email || "Chưa cập nhật email"}
          </Text>
        </div>
      </div>

      {/* Menu Actions */}
      <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <Button
          style={{ textAlign: "left", color: "#476481", fontWeight: 500 }}
          icon={<SettingOutlined />}
          type="text"
          block
        >
          Cài đặt tài khoản
        </Button>
        <Button
          style={{ textAlign: "left", fontWeight: 500 }}
          icon={<LogoutOutlined />}
          type="text"
          danger
          block
          onClick={() => logout()}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      content={content}
      trigger="click"
      overlayInnerStyle={{ padding: 0, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(122,157,193,0.2)' }}
      overlayStyle={{ zIndex: 999 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px', borderRadius: 24, transition: 'background 0.2s' }} className="user-header-btn">
        <CustomAvatar name={user?.Fullname || user?.Name} src={user?.AvatarUrl} size="default" />
        <Text strong style={{ color: '#476481' }}>{user?.Fullname || user?.Name || "User"}</Text>
      </div>
    </Popover>
  );
};