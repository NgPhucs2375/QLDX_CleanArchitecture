import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Descriptions, Tag, Avatar, Space, Card } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { IUser } from "./types";
import { Role } from "@routes/roles/types";

const { Text, Title } = Typography;

export const ShowUser = () => {
  const { queryResult } = useShow<IUser>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  // Lấy tên Role
  const { data: roleData, isLoading: isLoadingRole } = useOne<Role>({
    resource: "roles",
    id: record?.RoleId || "",
    queryOptions: { enabled: !!record?.RoleId },
  });

  return (
    <Show 
      isLoading={isLoading}
      title={<span style={{ color: "#476481", fontWeight: 700, fontSize: 20 }}>Chi Tiết Người Dùng</span>}
    >
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.05)", marginTop: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 24, borderBottom: '1px solid #e1e7ee' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={record?.Email ? `https://documents.vietbank.com.vn/avatar/${record.Email}.jpg` : undefined}
              style={{ border: '3px solid #7a9dc1' }}
            />
            <div>
              <Title level={3} style={{ margin: 0, color: '#476481' }}>{record?.FirstName} {record?.LastName}</Title>
              <Text style={{ color: '#6b7c93', fontSize: 16 }}>{record?.UserName}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={record?.EmailConfirmed ? "cyan" : "red"}>
                  {record?.EmailConfirmed ? "Tài khoản đang hoạt động" : "Tài khoản chưa kích hoạt"}
                </Tag>
              </div>
            </div>
          </div>

          <Descriptions 
            title={<Text strong style={{ fontSize: 16, color: '#476481' }}>Thông tin hệ thống</Text>} 
            bordered 
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label={<Text strong>Tên đăng nhập (LDAP)</Text>}>{record?.UserName}</Descriptions.Item>
            <Descriptions.Item label={<Text strong>Địa chỉ Email</Text>}>{record?.Email}</Descriptions.Item>
            <Descriptions.Item label={<Text strong>Họ Tên Đầy Đủ</Text>}>{record?.FirstName} {record?.LastName}</Descriptions.Item>
            <Descriptions.Item label={<Text strong>Vai trò / Quyền (Role)</Text>}>
              {isLoadingRole ? "Đang tải..." : <Tag color="blue">{roleData?.data?.Name || "Không xác định"}</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>ID Hệ Thống</Text>} span={2}>
              <Text type="secondary">{record?.Id}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </Show>
  );
};