import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Tag, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { IPurchaseRequest } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

const { Title, Text } = Typography;

// Việt hóa và tinh chỉnh màu sắc cho trạng thái
const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Nháp", color: "default" },
  2: { label: "Đơn vị đang duyệt", color: "orange" },
  3: { label: "Kiểm soát đang duyệt", color: "blue" },
  4: { label: "Yêu cầu chỉnh sửa", color: "warning" },
  5: { label: "Đã duyệt", color: "green" },
  6: { label: "Chờ xác nhận đặt hàng", color: "purple" },
  7: { label: "Hoàn thành", color: "cyan" },
  8: { label: "Đơn vị từ chối", color: "red" },
  9: { label: "Kiểm soát từ chối", color: "red" },
};

export const ListPurchaseRequest = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IPurchaseRequest>({
    resource: "purchase-requests",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "purchase-requests", ids });
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => setSelectedRowKeys(selectedRowKeys),
  };

  return (
    <List
      title={<Title level={3} style={{ margin: 0 }}>Danh sách Phiếu Đề Xuất</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="purchase-requests" action="delete">
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="purchase-requests" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("purchase-requests")}>Tạo mới</Button>
          </CanAccess>
        </Space>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="purchase-requests" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="Code" title="Mã phiếu" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm mã phiếu" /></FilterDropdown>)} />
        <Table.Column dataIndex="Status" title="Trạng thái" render={(value: number) => <Tag color={statusMap[value]?.color}>{statusMap[value]?.label || value}</Tag>} sorter />
        <Table.Column dataIndex="TotalProposedAmount" title="Đề xuất" align="right" render={(value: number) => <Text strong style={{ color: '#1677ff' }}>{value.toLocaleString("vi-VN")} ₫</Text>} sorter />
        <Table.Column dataIndex="TotalActualAmount" title="Thực tế" align="right" render={(value: number) => <Text strong style={{ color: '#52c41a' }}>{value.toLocaleString("vi-VN")} ₫</Text>} sorter />
        <Table.Column dataIndex="Created" title="Ngày tạo" render={(value) => <DateField format="DD/MM/YYYY HH:mm" value={value} />} sorter />
        <Table.Column title="Hành động" align="center" render={(_, record: IPurchaseRequest) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};