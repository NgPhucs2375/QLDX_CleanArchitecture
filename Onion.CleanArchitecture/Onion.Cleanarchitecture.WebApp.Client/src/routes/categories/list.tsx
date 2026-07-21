import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, DatePicker, Tag, Typography } from "antd";
import { ICategory } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const ListCategory = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<ICategory>({
    resource: "categories",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "categories", ids });
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <List
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Quản lý Danh Mục Sản Phẩm</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="categories" action="delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => handleDelete()}
              style={{ borderRadius: 6 }}
            >
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="categories" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("categories")} style={{ background: '#7a9dc1', borderColor: '#7a9dc1', borderRadius: 6 }}>
              Thêm mới
            </Button>
          </CanAccess>
        </Space>
      }
    >
      <Table
        {...tableProps}
        rowKey="Id"
        pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="categories" /> }}
        rowSelection={rowSelection}
      >
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column
          dataIndex="Code"
          title="Mã Danh Mục"
          sorter
          defaultSortOrder={getDefaultSortOrder("Code", sorters)}
          defaultFilteredValue={getDefaultFilter("Code", filters)}
          filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm mã..." /></FilterDropdown>)}
          render={(val) => <Text strong style={{ color: '#6b7c93' }}>{val}</Text>}
        />
        <Table.Column
          dataIndex="Name"
          title="Tên Danh Mục"
          sorter
          defaultSortOrder={getDefaultSortOrder("Name", sorters)}
          defaultFilteredValue={getDefaultFilter("Name", filters)}
          filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm tên..." /></FilterDropdown>)}
          render={(val) => <Text strong style={{ color: '#476481' }}>{val}</Text>}
        />
        <Table.Column
          dataIndex="IsActive"
          title="Trạng Thái"
          sorter
          defaultSortOrder={getDefaultSortOrder("IsActive", sorters)}
          render={(value: boolean) => value ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="default">Ngừng hoạt động</Tag>}
        />
        <Table.Column
          dataIndex="Created"
          title="Ngày Tạo"
          render={(value) => <DateField format="DD/MM/YYYY HH:mm" value={value} style={{ color: '#8c98a5' }} />}
          defaultFilteredValue={getDefaultFilter("Created", filters, "between")}
          filterDropdown={(props) => (<FilterDropdown {...props}><DatePicker.RangePicker format="DD/MM/YYYY" /></FilterDropdown>)}
          sorter
          defaultSortOrder={getDefaultSortOrder("Created", sorters)}
        />
        <Table.Column
          title="Hành Động"
          align="center"
          render={(_, record: ICategory) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.Id} />
              <EditButton hideText size="small" recordItemId={record.Id} />
              <DeleteButton hideText size="small" recordItemId={record.Id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};