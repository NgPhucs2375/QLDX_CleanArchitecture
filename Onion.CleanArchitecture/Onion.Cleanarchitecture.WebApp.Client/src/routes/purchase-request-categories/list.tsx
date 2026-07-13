import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, FilterDropdown, NumberField,
} from "@refinedev/antd";
import { Table, Space, Input, Button } from "antd";
import { IPurchaseRequestCategory } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

export const ListPurchaseRequestCategory = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IPurchaseRequestCategory>({
    resource: "purchase-request-categories",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "purchase-request-categories", ids });
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
          <CanAccess resource="purchase-request-categories" action="create">
            <Button onClick={() => create("purchase-request-categories")}>Create</Button>
          </CanAccess>
          <CanAccess resource="purchase-request-categories" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="purchase-request-categories" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="PurchaseRequestId" title="Purchase Request ID" sorter defaultFilteredValue={getDefaultFilter("PurchaseRequestId", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search" /></FilterDropdown>)} />
        <Table.Column dataIndex="CategoryId" title="Category ID" sorter />
        <Table.Column dataIndex="AllowedQuota" title="Allowed Quota" render={(v: number) => <NumberField value={v} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column dataIndex="TotalProposedAmount" title="Proposed" render={(v: number) => <NumberField value={v} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column dataIndex="Difference" title="Difference" render={(v: number) => <NumberField value={v} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column title="Actions" render={(_, record: IPurchaseRequestCategory) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
