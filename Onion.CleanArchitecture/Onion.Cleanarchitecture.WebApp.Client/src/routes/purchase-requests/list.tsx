import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown, NumberField,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Tag } from "antd";
import { IPurchaseRequest } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Draft", color: "default" },
  2: { label: "Pending Dept", color: "orange" },
  3: { label: "Pending Control", color: "blue" },
  4: { label: "Returned", color: "red" },
  5: { label: "Approved", color: "green" },
  6: { label: "Pending Order", color: "purple" },
  7: { label: "Completed", color: "cyan" },
  8: { label: "Rejected by Dept", color: "red" },
  9: { label: "Rejected by Control", color: "red" },
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
      headerButtons={
        <>
          <CanAccess resource="purchase-requests" action="create">
            <Button onClick={() => create("purchase-requests")}>Create</Button>
          </CanAccess>
          <CanAccess resource="purchase-requests" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="purchase-requests" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="Code" title="Code" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search Code" /></FilterDropdown>)} />
        <Table.Column dataIndex="DepartmentId" title="Department ID" sorter />
        <Table.Column dataIndex="Status" title="Status" render={(value: number) => <Tag color={statusMap[value]?.color}>{statusMap[value]?.label || value}</Tag>} sorter />
        <Table.Column dataIndex="TotalProposedAmount" title="Proposed" render={(value: number) => <NumberField value={value} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column dataIndex="TotalActualAmount" title="Actual" render={(value: number) => <NumberField value={value} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column dataIndex="Created" title="Created At" render={(value) => <DateField format="LLL" value={value} />} sorter />
        <Table.Column title="Actions" render={(_, record: IPurchaseRequest) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
