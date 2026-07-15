import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, FilterDropdown, NumberField,
} from "@refinedev/antd";
import { Table, Space, Input, Button } from "antd";
import { IConfigCategory } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

export const ListConfigCategory = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IConfigCategory>({
    resource: "config-categories",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "config-categories", ids });
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
          <CanAccess resource="config-categories" action="create">
            <Button onClick={() => create("config-categories")}>Create</Button>
          </CanAccess>
          <CanAccess resource="config-categories" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="config-categories" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="ProposalConfigId" title="Proposal Config ID" sorter defaultSortOrder={getDefaultSortOrder("ProposalConfigId", sorters)} defaultFilteredValue={getDefaultFilter("ProposalConfigId", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search" /></FilterDropdown>)} />
        <Table.Column dataIndex="CategoryId" title="Category ID" sorter defaultSortOrder={getDefaultSortOrder("CategoryId", sorters)} />
        <Table.Column dataIndex="DepartmentId" title="Department ID" sorter defaultSortOrder={getDefaultSortOrder("DepartmentId", sorters)} />
        <Table.Column dataIndex="AllowedQuota" title="Allowed Quota" sorter defaultSortOrder={getDefaultSortOrder("AllowedQuota", sorters)} render={(value: number) => <NumberField value={value} options={{ style: "decimal" }} />} />
        <Table.Column dataIndex="UsedAmount" title="Used" sorter defaultSortOrder={getDefaultSortOrder("UsedAmount", sorters)} render={(value: number) => <NumberField value={value} options={{ style: "decimal" }} />} />
        <Table.Column dataIndex="RemainingAmount" title="Remaining" sorter defaultSortOrder={getDefaultSortOrder("RemainingAmount", sorters)} render={(value: number) => <NumberField value={value} options={{ style: "decimal" }} />} />
        <Table.Column title="Actions" render={(_, record: IConfigCategory) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
