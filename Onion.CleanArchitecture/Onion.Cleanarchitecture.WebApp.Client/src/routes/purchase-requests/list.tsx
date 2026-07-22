import { useTable, List, ShowButton, getDefaultSortOrder, DateField, FilterDropdown } from "@refinedev/antd";
import { Table, Space, Input, Button, Tag, Typography, Avatar } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { IPurchaseRequest } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess, useMany } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import "../../assets/purchase-request.css";

const { Title, Text } = Typography;

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Bản nháp", color: "default" },        // Slate
  2: { label: "Chờ Đơn vị duyệt", color: "processing" }, // Blue
  3: { label: "Chờ Kiểm soát duyệt", color: "geekblue" }, // Xanh đậm hơn
  4: { label: "Trả về chỉnh sửa", color: "warning" },  // Amber/Orange
  5: { label: "Chờ đặt hàng", color: "purple" },       // Purple
  6: { label: "Hoàn thành", color: "success" },      // Emerald/Green
  7: { label: "Đơn vị từ chối", color: "error" },    // Red
  8: { label: "Kiểm soát từ chối", color: "error" },  // Red
};

export const ListPurchaseRequest = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IPurchaseRequest>({
    resource: "purchase-requests",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Created", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const createdByIds = React.useMemo(() =>
    [...new Set((tableProps.dataSource || []).map((r: any) => r.CreatedBy).filter(Boolean))],
    [tableProps.dataSource]
  );
  const { data: usersData } = useMany({ resource: "users", ids: createdByIds, queryOptions: { enabled: createdByIds.length > 0 } });

  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) };

  return (
    <List
      title={<Title level={3} className="pr-m-0 pr-text-emerald">Danh sách Đề Xuất</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="purchase-requests" action="delete">
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => deleteMutate({ resource: "purchase-requests", ids: selectedRowKeys.map(k => k.toString()) })}>
              Xóa ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="purchase-requests" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("purchase-requests")} className="pr-bg-emerald">Tạo mới</Button>
          </CanAccess>
        </Space>
      }
    >
      <Table {...tableProps} rowKey="Id" rowSelection={rowSelection} pagination={{ ...tableProps.pagination, showTotal: (t) => <PaginationTotal total={t} entityName="đề xuất" /> }}>
        <Table.Column 
          dataIndex="Code" 
          title="Mã phiếu" 
          sorter 
          defaultSortOrder={getDefaultSortOrder("Code", sorters)} 
          defaultFilteredValue={getDefaultFilter("Code", filters)} 
          filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm mã phiếu..." /></FilterDropdown>)} 
          render={(val) => <Text strong >{val}</Text>}
        />
        <Table.Column 
          dataIndex="CreatedBy" 
          title="Người tạo" 
          render={(val: string) => {
            const user = (usersData?.data as any[])?.find((u: any) => u.Id === val || u.id === val);
            const name = user?.UserName || user?.userName || user?.Name || user?.name || val;
            return <Space><Avatar size="small" icon={<UserOutlined />} /> <Text>{name || "Hệ thống"}</Text></Space>;
          }} 
        />
        <Table.Column 
          dataIndex="Status" 
          title="Trạng thái" 
          render={(val: number) => <Tag color={statusMap[val]?.color} className="pr-tag-rounded">{statusMap[val]?.label || val}</Tag>} 
          sorter 
        />
        <Table.Column 
          dataIndex="Created" 
          title="Ngày tạo" 
          render={(value) => <DateField format="DD/MM/YYYY HH:mm" value={value} />} 
          sorter 
        />
        <Table.Column 
          title="Hành động" 
          align="center" 
          render={(_, record: IPurchaseRequest) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.Id} />
            </Space>
          )} 
        />
      </Table>
    </List>
  );
};