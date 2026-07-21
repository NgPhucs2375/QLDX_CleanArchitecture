import {
  DeleteButton,
  EditButton,
  CloneButton,
  List,
  ShowButton,
  useTable,
  FilterDropdown
} from "@refinedev/antd";
import { Role } from "./types";
import { Space, Table, Typography, Tag, Input, Button } from "antd";
import { getDefaultFilter, useNavigation, CanAccess } from "@refinedev/core";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const ListRole = () => {
  const { tableProps, filters } = useTable<Role>({
    resource: "roles",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "asc" }] },
  });

  const { create } = useNavigation();

  return (
    <List 
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Danh Sách Vai Trò</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="roles" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("roles")} style={{ background: '#7a9dc1', borderColor: '#7a9dc1', borderRadius: 6 }}>
              Thêm Mới Vai Trò
            </Button>
          </CanAccess>
        </Space>
      }
    >
      <Table 
        {...tableProps} 
        rowKey="Id"
        pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="roles" /> }}
      >
        <Table.Column 
          dataIndex="Id" 
          title="ID" 
          render={(val) => <Text style={{ color: '#8c98a5' }}>{val}</Text>}
        />
        <Table.Column 
          dataIndex="Name" 
          title="Tên Vai Trò" 
          defaultFilteredValue={getDefaultFilter("Name", filters)}
          filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm tên vai trò..." /></FilterDropdown>)}
          render={(val) => <Text strong style={{ color: '#476481', fontSize: 15 }}>{val}</Text>}
        />
        <Table.Column 
          dataIndex="NormalizedName" 
          title="Tên Chuẩn Hóa" 
          render={(val) => <Tag color="geekblue">{val}</Tag>}
        />
        <Table.Column
          title="Thao Tác"
          width={180}
          align="center"
          render={(_, record: Role) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.Id} />
              <EditButton hideText size="small" recordItemId={record.Id} />
              <CloneButton hideText size="small" recordItemId={record.Id} />
              <DeleteButton hideText size="small" recordItemId={record.Id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};