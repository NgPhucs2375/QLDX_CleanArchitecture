import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, FilterDropdown, useSelect,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Select, Typography, Tag } from "antd";
import { IProduct } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const STYLES = `
  .pearl-table-wrapper { padding: 0; overflow-x: auto; background: #fff; border-radius: 8px; border: 1px solid #e1e7ee; box-shadow: 0 2px 10px rgba(122, 157, 193, 0.05); }
  .pearl-table-wrapper .ant-table { font-size: 15px; }
  .pearl-table-wrapper .ant-table-thead > tr > th {
    background: #7a9dc1 !important; color: #ffffff !important; 
    font-weight: 600; font-size: 14px; border-bottom: 2px solid #5d82a6 !important;
    white-space: nowrap; padding: 14px 16px;
  }
  .pearl-table-wrapper .ant-table-tbody > tr > td { padding: 14px 16px !important; border-bottom: 1px solid #f2f6fb !important; vertical-align: middle; }
  .pearl-table-wrapper .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
`;

export const ListProduct = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IProduct>({
    resource: "products",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
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

  return (
    <>
      <style>{STYLES}</style>
      <List
        title={<Title level={3} style={{ margin: 0, color: '#476481', fontWeight: 700 }}>Danh mục Sản phẩm</Title>}
        headerButtons={
          <Space>
            <CanAccess resource="products" action="delete">
              <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()} style={{ borderRadius: 6 }}>
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
        <div className="pearl-table-wrapper">
          <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="products" /> }} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}>
            <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
            <Table.Column dataIndex="Code" title="Mã SP" sorter defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm mã..." /></FilterDropdown>)} render={(val) => <Text strong style={{ color: '#476481' }}>{val}</Text>} />
            <Table.Column dataIndex="Name" title="Tên Sản Phẩm" sorter defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm tên..." /></FilterDropdown>)} />
            <Table.Column 
              dataIndex="CategoryId" title="Danh mục" 
              render={(value) => {
                // Map ID ra Tên danh mục để hiển thị đẹp hơn
                const catName = categorySelectProps.options?.find(opt => opt.value == value)?.label;
                return <Text style={{ color: '#6b7c93' }}>{catName || value || "—"}</Text>;
              }}
              filterDropdown={(props) => (<FilterDropdown {...props} mapValue={(selectedKey) => String(selectedKey)}><Select style={{ minWidth: 200 }} {...categorySelectProps} /></FilterDropdown>)}
            />
            <Table.Column dataIndex="UnitPrice" title="Đơn giá" align="right" sorter render={(value: number) => <Text strong style={{ color: '#7a9dc1' }}>{value?.toLocaleString("vi-VN")} ₫</Text>} />
            <Table.Column dataIndex="Unit" title="ĐVT" align="center" sorter />
            <Table.Column 
              dataIndex="IsActive" title="Trạng thái" align="center" sorter 
              render={(value: boolean) => value 
                ? <Tag color="cyan" style={{ borderRadius: 12 }}>Đang hoạt động</Tag> 
                : <Tag color="default" style={{ borderRadius: 12 }}>Ngừng kinh doanh</Tag>} 
            />
            <Table.Column title="Hành động" align="center" render={(_, record: IProduct) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
          </Table>
        </div>
      </List>
    </>
  );
};