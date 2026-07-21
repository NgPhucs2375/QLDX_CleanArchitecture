import React from "react";
import {
  useTable, List, ShowButton, EditButton, DeleteButton
  , FilterDropdown, useSelect,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Select, Typography, Tag, Card } from "antd";
import { IProduct } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess, useMany } from "@refinedev/core";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const ListProduct = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, filters } = useTable<IProduct>({
    resource: "products",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  // Lấy chính xác danh sách Tên danh mục dựa trên ID đang hiển thị ở bảng hiện tại
  const categoryIds = tableProps?.dataSource?.map((item) => item.CategoryId) ?? [];
  const { data: categoryData, isLoading: categoryIsLoading } = useMany({
    resource: "categories",
    ids: categoryIds,
    queryOptions: { enabled: categoryIds.length > 0 },
  });

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    optionLabel: "Name",
    optionValue: "Id",
    defaultValue: getDefaultFilter("CategoryId", filters, "eq"),
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "products", ids });
    setSelectedRowKeys([]);
  };
  console.log("Category Data:", categoryData);
  return (
    <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(122,157,193,0.08)" }} bodyStyle={{ padding: 0 }}>
      <List
        title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Danh mục Sản phẩm</Title>}
        headerButtons={
          <Space>
            <CanAccess resource="products" action="delete">
              <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={handleDelete} style={{ borderRadius: 6 }}>
                Xóa đã chọn ({selectedRowKeys.length})
              </Button>
            </CanAccess>
            <CanAccess resource="products" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => create("products")} style={{ background: '#7a9dc1', borderColor: '#7a9dc1', borderRadius: 6 }}>
                Thêm Sản phẩm
              </Button>
            </CanAccess>
          </Space>
        }
      >
        <Table 
          {...tableProps} 
          rowKey="Id" 
          pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="sản phẩm" /> }} 
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          size="middle"
        >
          <Table.Column dataIndex="Code" title={<Text strong style={{ color: '#476481' }}>Mã SP</Text>} sorter defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm mã..." /></FilterDropdown>)} render={(val) => <Text strong style={{ color: '#476481' }}>{val}</Text>} />
          <Table.Column dataIndex="Name" title={<Text strong style={{ color: '#476481' }}>Tên Sản Phẩm</Text>} sorter defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm tên..." /></FilterDropdown>)} />
          <Table.Column 
            dataIndex="CategoryId" title={<Text strong style={{ color: '#476481' }}>Danh mục</Text>} 
            render={(value) => {
              if (categoryIsLoading) return <Text type="secondary">Đang tải...</Text>;
              const catName = (categoryData?.data.data||[]).find((item) => item.id == value)?.Name;
              return <Text style={{ color: '#6b7c93' }}>{catName || value || "—"}</Text>;
            }}
            filterDropdown={(props) => (<FilterDropdown {...props} mapValue={(selectedKey) => String(selectedKey)}><Select style={{ minWidth: 200 }} placeholder="Chọn danh mục" {...categorySelectProps} /></FilterDropdown>)}
          />
          <Table.Column dataIndex="UnitPrice" title={<Text strong style={{ color: '#476481' }}>Đơn giá</Text>} align="right" sorter render={(value: number) => <Text strong style={{ color: '#7a9dc1' }}>{value?.toLocaleString("vi-VN")} ₫</Text>} />
          <Table.Column dataIndex="Unit" title={<Text strong style={{ color: '#476481' }}>ĐVT</Text>} align="center" sorter />
          <Table.Column 
            dataIndex="IsActive" title={<Text strong style={{ color: '#476481' }}>Trạng thái</Text>} align="center" sorter 
            render={(value: boolean) => value 
              ? <Tag color="cyan" style={{ borderRadius: 12 }}>Đang hoạt động</Tag> 
              : <Tag color="default" style={{ borderRadius: 12 }}>Ngừng kinh doanh</Tag>} 
          />
          <Table.Column title={<Text strong style={{ color: '#476481' }}>Hành động</Text>} align="center" render={(_, record: IProduct) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
        </Table>
      </List>
    </Card>
  );
};