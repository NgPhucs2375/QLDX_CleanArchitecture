import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Tag, Typography } from "antd";
import { IProposalConfig } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

// Đổi màu trạng thái sang dải màu thanh lịch hơn
const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Bản nháp", color: "default" },
  2: { label: "Đang áp dụng", color: "geekblue" }, // Xanh Blue 
  3: { label: "Ngưng áp dụng", color: "volcano" },
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
      title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Danh sách Cấu hình Đề xuất</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="proposal-configs" action="delete">
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
          <CanAccess resource="proposal-configs" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("proposal-configs")} style={{ background: '#7a9dc1', borderColor: '#7a9dc1', borderRadius: 6 }}>
              Khởi tạo cấu hình mới
            </Button>
          </CanAccess>
        </Space>
      }
    >
      <Table 
        {...tableProps} 
        rowKey="Id" 
        pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="proposal-configs" /> }} 
        rowSelection={rowSelection}
      >
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="Code" title="Mã Cấu Hình" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Nhập mã..." /></FilterDropdown>)} render={(val) => <Typography.Text strong style={{ color: '#476481' }}>{val}</Typography.Text>} />
        <Table.Column dataIndex="Name" title="Tên Cấu Hình" sorter defaultSortOrder={getDefaultSortOrder("Name", sorters)} defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Nhập tên..." /></FilterDropdown>)} />
        <Table.Column dataIndex="EffectiveDate" title="Ngày Hiệu Lực" render={(value) => <DateField format="DD/MM/YYYY" value={value} style={{ fontWeight: 500, color: '#6b7c93' }} />} sorter defaultSortOrder={getDefaultSortOrder("EffectiveDate", sorters)} />
        <Table.Column dataIndex="Status" title="Trạng Thái" render={(value: number) => <Tag color={statusMap[value]?.color} style={{ padding: '2px 10px', borderRadius: 12 }}>{statusMap[value]?.label || value}</Tag>} sorter defaultSortOrder={getDefaultSortOrder("Status", sorters)} />
        <Table.Column title="Hành Động" align="center" render={(_, record: IProposalConfig) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};