import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, FilterDropdown, NumberField,
} from "@refinedev/antd";
import { Table, Space, Input, Button } from "antd";
import { IPurchaseRequestItem } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

export const ListPurchaseRequestItem = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IPurchaseRequestItem>({
    resource: "purchase-request-items",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "purchase-request-items", ids });
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
          <CanAccess resource="purchase-request-items" action="create">
            <Button onClick={() => create("purchase-request-items")}>Create</Button>
          </CanAccess>
          <CanAccess resource="purchase-request-items" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="purchase-request-items" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="PurchaseRequestCategoryId" title="PR Category ID" sorter defaultFilteredValue={getDefaultFilter("PurchaseRequestCategoryId", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search" /></FilterDropdown>)} />
        <Table.Column dataIndex="ProductId" title="Product ID" sorter />
        <Table.Column dataIndex="UnitPrice" title="Unit Price" render={(v: number) => <NumberField value={v} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column dataIndex="ProposedQuantity" title="Proposed Qty" sorter />
        <Table.Column dataIndex="TotalAmount" title="Total" render={(v: number) => <NumberField value={v} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column dataIndex="ActualQuantity" title="Actual Qty" sorter />
        <Table.Column dataIndex="ActualTotalAmount" title="Actual Total" render={(v: number) => <NumberField value={v} options={{ style: "currency", currency: "VND" }} />} sorter />
        <Table.Column title="Actions" render={(_, record: IPurchaseRequestItem) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
