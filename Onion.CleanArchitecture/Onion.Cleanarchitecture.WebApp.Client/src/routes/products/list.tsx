import {
  useTable,
  List,
  ShowButton,
  EditButton,
  DeleteButton,
  getDefaultSortOrder,
  DateField,
  FilterDropdown,
  useSelect,
} from "@refinedev/antd";
import { Table, Space, Input, Button, DatePicker, Select } from "antd";
import { IProduct } from "./types";
import {
  getDefaultFilter,
  useNavigation,
  useDeleteMany,
  useMany,
  CanAccess,
} from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

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

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  return (
    <List
      headerButtons={
        <>
          <CanAccess resource="products" action="create">
            <Button onClick={() => create("products")}>Create</Button>
          </CanAccess>
          <CanAccess resource="products" action="delete">
            <Button
              disabled={selectedRowKeys.length === 0}
              onClick={() => handleDelete()}
            >
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table
        {...tableProps}
        rowKey="Id"
        pagination={{
          ...tableProps.pagination,
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="products" />
          ),
        }}
        rowSelection={rowSelection}
      >
        <Table.Column
          dataIndex="Id"
          title="ID"
          sorter
          defaultSortOrder={getDefaultSortOrder("Id", sorters)}
        />
        <Table.Column
          dataIndex="Code"
          title="Code"
          sorter
          defaultSortOrder={getDefaultSortOrder("Code", sorters)}
          defaultFilteredValue={getDefaultFilter("Code", filters)}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Search Code" />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="Name"
          title="Name"
          sorter
          defaultSortOrder={getDefaultSortOrder("Name", sorters)}
          defaultFilteredValue={getDefaultFilter("Name", filters)}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder="Search Name" />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="CategoryId"
          title="Category"
          render={(value) => {
            if (!value) return "-";
            return value;
          }}
          filterDropdown={(props) => (
            <FilterDropdown
              {...props}
              mapValue={(selectedKey) => String(selectedKey)}
            >
              <Select style={{ minWidth: 200 }} {...categorySelectProps} />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="UnitPrice"
          title="Unit Price"
          sorter
          defaultSortOrder={getDefaultSortOrder("UnitPrice", sorters)}
          render={(value: number) =>
            value?.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          }
        />
        <Table.Column
          dataIndex="Unit"
          title="Unit"
          sorter
          defaultSortOrder={getDefaultSortOrder("Unit", sorters)}
        />
        <Table.Column
          dataIndex="IsActive"
          title="Active"
          sorter
          defaultSortOrder={getDefaultSortOrder("IsActive", sorters)}
          render={(value: boolean) =>
            value ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : (
              <CloseCircleOutlined style={{ color: "red" }} />
            )
          }
        />
        <Table.Column
          dataIndex="Created"
          title="Created At"
          render={(value) => <DateField format="LLL" value={value} />}
          defaultFilteredValue={getDefaultFilter("Created", filters, "between")}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <DatePicker.RangePicker />
            </FilterDropdown>
          )}
          sorter
          defaultSortOrder={getDefaultSortOrder("Created", sorters)}
        />
        <Table.Column
          title="Actions"
          render={(_, record: IProduct) => (
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
