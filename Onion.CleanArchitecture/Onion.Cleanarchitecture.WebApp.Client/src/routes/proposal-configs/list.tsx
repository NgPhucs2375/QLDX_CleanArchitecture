import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Tag,Typography } from "antd";
import { IProposalConfig } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
const { Title } = Typography;
const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Nháp", color: "default" },
  2: { label: "Đang áp dụng", color: "green" },
  3: { label: "Ngưng áp dụng", color: "red" },
};

export const ListProposalConfig = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IProposalConfig>({
    resource: "proposal-configs",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "proposal-configs", ids });
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => setSelectedRowKeys(selectedRowKeys),
  };

  return (
    <List
      // Đồng bộ title
      title={<Title level={3} style={{ margin: 0 }}>Danh sách Cấu hình Đề xuất</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="proposal-configs" action="delete">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              disabled={selectedRowKeys.length === 0} 
              onClick={() => handleDelete()}
            >
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="proposal-configs" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("proposal-configs")}>
              Tạo mới
            </Button>
          </CanAccess>
        </Space>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="proposal-configs" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="Code" title="Mã" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm Mã" /></FilterDropdown>)} />
        <Table.Column dataIndex="Name" title="Tên Cấu Hình" sorter defaultSortOrder={getDefaultSortOrder("Name", sorters)} defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm Tên" /></FilterDropdown>)} />
        <Table.Column dataIndex="EffectiveDate" title="Ngày Hiệu Lực" render={(value) => <DateField format="LL" value={value} />} sorter defaultSortOrder={getDefaultSortOrder("EffectiveDate", sorters)} />
        <Table.Column dataIndex="Status" title="Trạng Thái" render={(value: number) => <Tag color={statusMap[value]?.color}>{statusMap[value]?.label || value}</Tag>} sorter defaultSortOrder={getDefaultSortOrder("Status", sorters)} />
        <Table.Column title="Hành Động" render={(_, record: IProposalConfig) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
