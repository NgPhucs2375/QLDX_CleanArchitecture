import {
  useTable, List, ShowButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button } from "antd";
import { IPurchaseRequestLog } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

export const ListPurchaseRequestLog = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IPurchaseRequestLog>({
    resource: "purchase-request-logs",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "purchase-request-logs", ids });
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
          <CanAccess resource="purchase-request-logs" action="create">
            <Button onClick={() => create("purchase-request-logs")}>Create</Button>
          </CanAccess>
          <CanAccess resource="purchase-request-logs" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="purchase-request-logs" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="PurchaseRequestId" title="Purchase Request ID" sorter defaultFilteredValue={getDefaultFilter("PurchaseRequestId", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search" /></FilterDropdown>)} />
        <Table.Column dataIndex="UserId" title="User ID" sorter />
        <Table.Column dataIndex="Action" title="Action" sorter />
        <Table.Column dataIndex="Note" title="Note" ellipsis />
        <Table.Column dataIndex="Created" title="Logged At" render={(value) => <DateField format="LLL" value={value} />} sorter />
        <Table.Column title="Actions" render={(_, record: IPurchaseRequestLog) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
