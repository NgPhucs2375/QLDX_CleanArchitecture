import React, { useMemo } from "react";
import { useTable, List, ShowButton, EditButton, DeleteButton, FilterDropdown, useSelect } from "@refinedev/antd";
import { Table, Space, Input, Button, Select, Typography, Tag, Tooltip } from "antd";
import { IProduct } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess, useMany } from "@refinedev/core";
import { PaginationTotal } from "@components/pagination-total";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../assets/product.css";

const { Title, Text } = Typography;

export const ListProduct = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, filters, sorters } = useTable<IProduct>({
    resource: "products",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const categoryIds = useMemo(() => {
    const ids = tableProps.dataSource?.map((item) => item.CategoryId) || [];
    return [...new Set(ids.filter(Boolean))] as (string | number)[];
  }, [tableProps.dataSource]);

  const { data: categoryData, isFetching: catFetching } = useMany({
    resource: "categories",
    ids: categoryIds,
    queryOptions: { enabled: categoryIds.length > 0 },
  });

  // Xử lý an toàn: API của bạn có thể lồng data trong data (như code cũ bạn đã báo)
  const categoriesList = Array.isArray(categoryData?.data) ? categoryData?.data : (categoryData?.data as any)?.data || [];

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
    optionLabel: "Name",
    optionValue: "Id",
    defaultValue: getDefaultFilter("CategoryId", filters, "eq"),
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  return (
    <List
      title={<Title level={3} className="pd-m-0 pd-text-ocean pd-font-bold">Danh mục sản phẩm</Title>}
      headerButtons={
        <Space>
          <CanAccess resource="products" action="delete">
            <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => { deleteMutate({ resource: "products", ids: selectedRowKeys.map((key) => key.toString()) }); setSelectedRowKeys([]); }}>
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </CanAccess>
          <CanAccess resource="products" action="create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => create("products")} className="pd-btn-primary">
              Thêm mới sản phẩm
            </Button>
          </CanAccess>
        </Space>
      }
    >
      <Table 
        {...tableProps} 
        rowKey="Id" 
        loading={tableProps.loading || catFetching}
        pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="sản phẩm" /> }} 
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      >
        <Table.Column dataIndex="Code" title="Mã sản phẩm" sorter defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm mã..." /></FilterDropdown>)} render={(val) => <Text strong className="pd-text-ocean">{val}</Text>} />
        <Table.Column dataIndex="Name" title="Tên sản phẩm" sorter defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Tìm tên..." /></FilterDropdown>)} />
        <Table.Column 
          dataIndex="CategoryId" title="Danh mục áp dụng" 
          render={(value) => {
            const catName = categoriesList.find((item: any) => String(item.Id || item.id) === String(value))?.Name;
            return catName ? <Tag color="blue">{catName}</Tag> : <Text type="secondary">—</Text>;
          }}
          filterDropdown={(props) => (<FilterDropdown {...props} mapValue={(selectedKey) => String(selectedKey)}><Select style={{ minWidth: 200 }} placeholder="Chọn danh mục" {...categorySelectProps} /></FilterDropdown>)}
        />
        <Table.Column dataIndex="UnitPrice" title="Đơn giá" align="right" sorter render={(value: number) => <Text strong style={{ color: '#0d9488' }}>{value?.toLocaleString("vi-VN")} ₫</Text>} />
        <Table.Column dataIndex="Unit" title="Đơn vị tính" align="center" sorter />
        <Table.Column 
          dataIndex="IsActive" title="Trạng thái" align="center" sorter 
          render={(value: boolean) => value 
            ? <Tag color="success" className="pd-tag-rounded">Đang hoạt động</Tag> 
            : <Tag color="default" className="pd-tag-rounded">Ngừng kinh doanh</Tag>} 
        />
        <Table.Column title="Hành động" align="center" render={(_, record: IProduct) => (
            <Space>
              <Tooltip title="Xem chi tiết"><ShowButton hideText size="small" recordItemId={record.Id} /></Tooltip>
              <Tooltip title="Chỉnh sửa"><EditButton hideText size="small" recordItemId={record.Id} /></Tooltip>
              <Tooltip title="Xóa"><DeleteButton hideText size="small" recordItemId={record.Id} /></Tooltip>
            </Space>
        )} />
      </Table>
    </List>
  );
};