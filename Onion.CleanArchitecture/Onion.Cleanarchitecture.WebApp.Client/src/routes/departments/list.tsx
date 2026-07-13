import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, DatePicker } from "antd";
import { IDepartment } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export const ListDepartment = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IDepartment>({
    resource: "departments",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "departments", ids });
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => setSelectedRowKeys(selectedRowKeys),
  };

  return (
    <List
      headerButtons={
        <>
          <CanAccess resource="departments" action="create">
            <Button onClick={() => create("departments")}>Create</Button>
          </CanAccess>
          <CanAccess resource="departments" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="departments" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="Code" title="Code" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search Code" /></FilterDropdown>)} />
        <Table.Column dataIndex="Name" title="Name" sorter defaultSortOrder={getDefaultSortOrder("Name", sorters)} defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search Name" /></FilterDropdown>)} />
        <Table.Column dataIndex="IsActive" title="Active" sorter defaultSortOrder={getDefaultSortOrder("IsActive", sorters)} render={(value: boolean) => value ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />} />
        <Table.Column dataIndex="Created" title="Created At" render={(value) => <DateField format="LLL" value={value} />} defaultFilteredValue={getDefaultFilter("Created", filters, "between")} filterDropdown={(props) => (<FilterDropdown {...props}><DatePicker.RangePicker /></FilterDropdown>)} sorter defaultSortOrder={getDefaultSortOrder("Created", sorters)} />
        <Table.Column title="Actions" render={(_, record: IDepartment) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
