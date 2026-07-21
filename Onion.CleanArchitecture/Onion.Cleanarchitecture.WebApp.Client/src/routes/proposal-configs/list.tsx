import { useTable, List, ShowButton, EditButton, DeleteButton, getDefaultSortOrder, DateField, FilterDropdown } from "@refinedev/antd";
import { Table, Space, Input, Button, Tag, Typography } from "antd";
import { IProposalConfig } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../assets/proposal-config.css"; 

const { Title, Text } = Typography;

const statusMap: Record<number, { label: string; color: string }> = { 
  1: { label: "Bản nháp", color: "default" }, 
  2: { label: "Đang áp dụng", color: "geekblue" }, 
  3: { label: "Ngưng áp dụng", color: "volcano" } 
};

export const ListProposalConfig = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IProposalConfig>({ 
    resource: "proposal-configs", 
    pagination: { current: 1, pageSize: 10 }, 
    sorters: { initial: [{ field: "Id", order: "desc" }] } 
  });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  return (
    <List
      title={<Title level={3} className="pc-m-0 pc-text-ocean pc-font-bold">Danh sách Cấu hình Đề xuất</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="proposal-configs" action="delete">
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => { deleteMutate({ resource: "proposal-configs", ids: selectedRowKeys.map((key) => key.toString()) }); setSelectedRowKeys([]); }}>
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="proposal-configs" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("proposal-configs")} className="pc-btn-primary">Khởi tạo cấu hình mới</Button>
          </CanAccess>
        </Space>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="proposal-configs" /> }} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}>
        {/* Đã xóa Table.Column của ID tại đây */}
        
        <Table.Column dataIndex="Code" title="Mã Cấu Hình" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Nhập mã..." /></FilterDropdown>)} render={(val) => <Text strong className="pc-text-ocean">{val}</Text>} />
        
        <Table.Column dataIndex="Name" title="Tên Cấu Hình" sorter defaultSortOrder={getDefaultSortOrder("Name", sorters)} defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Nhập tên..." /></FilterDropdown>)} />
        
        <Table.Column dataIndex="EffectiveDate" title="Ngày Hiệu Lực" render={(value) => <DateField format="DD/MM/YYYY" value={value} className="pc-font-bold pc-text-secondary" />} sorter />
        
        <Table.Column dataIndex="Status" title="Trạng Thái" render={(value: number) => <Tag color={statusMap[value]?.color} className="pc-tag-rounded">{statusMap[value]?.label || value}</Tag>} sorter />
        
        <Table.Column title="Hành Động" align="center" render={(_, record: IProposalConfig) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};