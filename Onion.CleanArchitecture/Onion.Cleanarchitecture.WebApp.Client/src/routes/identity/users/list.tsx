import {
  DeleteButton, EditButton, CloneButton, List, ShowButton,
  useTable, useSelect, FilterDropdown,
} from "@refinedev/antd";
import { IUser, IUserShort } from "./types";
import { Input, Select, Space, Table, Tag, Typography, Card } from "antd";
import { getDefaultFilter, useMany } from "@refinedev/core";
import { CustomAvatar } from "@components/custom-avatar";
import { Role } from "@routes/roles/types";

const { Text } = Typography;

export const ListUser = () => {
  const { tableProps, filters } = useTable<IUserShort>({
    resource: "users",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "asc" }] },
  });

  const { data: roles, isLoading } = useMany<Role>({
    resource: "roles",
    ids: tableProps?.dataSource?.map((user) => user.RoleId) ?? [],
  });

  const { selectProps } = useSelect({
    resource: "roles",
    optionLabel: "Name",
    optionValue: "Id",
    defaultValue: getDefaultFilter("RoleId", filters, "eq"),
  });

  return (
    <Card 
      bordered={false} 
      style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(13,148,136,0.08)" }}
      bodyStyle={{ padding: 0 }}
    >
      <List 
        title={<span style={{ color: "#0f766e", fontWeight: 700, fontSize: 20 }}>Quản Lý Người Dùng</span>}
      >
        <Table {...tableProps} rowKey="Id" size="middle">
          <Table.Column<IUser>
            title="#"
            key="rowNumber"
            width={60}
            render={(_text, _record, index) => <Text style={{ color: "#475569" }}>{index + 1}</Text>}
          />
          <Table.Column<IUser>
            dataIndex="Name"
            title={<Text strong style={{ color: '#0f766e' }}>Họ Tên</Text>}
            render={(_, record: IUserShort) => (
              <Space>
                <CustomAvatar
                  src={`https://documents.vietbank.com.vn/avatar/${record.Email}.jpg`}
                  name={`${record.FirstName} ${record.LastName}`}
                  size="large"
                />
                <Text strong style={{ color: '#0f766e' }}>{`${record.FirstName} ${record.LastName}`}</Text>
              </Space>
            )}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Input placeholder="Tìm kiếm họ tên..." />
              </FilterDropdown>
            )}
            defaultFilteredValue={getDefaultFilter("Name", filters)}
          />
          <Table.Column<IUser>
            dataIndex="RoleId"
            title={<Text strong style={{ color: '#0f766e' }}>Quyền</Text>}
            render={(value) => {
              if (isLoading) return <Text type="secondary">Đang tải...</Text>;
              const roleName = roles?.data?.find((role) => role.Id == value)?.Name ?? "Chưa phân quyền";
              return <Tag color="cyan">{roleName}</Tag>;
            }}
            filterDropdown={(props) => (
              <FilterDropdown {...props} mapValue={(selectedKey) => String(selectedKey)}>
                <Select style={{ minWidth: 200 }} placeholder="Chọn quyền..." {...selectProps} />
              </FilterDropdown>
            )}
            defaultFilteredValue={getDefaultFilter("RoleId", filters, "eq")}
          />
          <Table.Column<IUser> 
            dataIndex="Email" 
            title={<Text strong style={{ color: '#0f766e' }}>Email</Text>} 
            render={(val) => <Text style={{ color: "#475569" }}>{val}</Text>}
          />
          <Table.Column<IUser>
            dataIndex="EmailConfirmed"
            title={<Text strong style={{ color: '#0f766e' }}>Trạng thái</Text>}
            render={(value) => (
              <Tag color={value ? "teal" : "red"} style={{ borderRadius: 4 }}>
                {value ? "Đang hoạt động" : "Chưa kích hoạt"}
              </Tag>
            )}
          />
          <Table.Column
            title={<Text strong style={{ color: '#0f766e' }}>Thao tác</Text>}
            width={160}
            render={(_, record: IUser) => (
              <Space size="small">
                <ShowButton hideText size="small" recordItemId={record.Id} />
                <EditButton hideText size="small" recordItemId={record.Id} />
                <CloneButton hideText size="small" recordItemId={record.Id} />
                <DeleteButton hideText size="small" recordItemId={record.Id} />
              </Space>
            )}
          />
        </Table>
      </List>
    </Card>
  );
};