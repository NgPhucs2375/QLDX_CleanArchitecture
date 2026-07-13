import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, DateField, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, DatePicker, Tag } from "antd";
import { IProposalConfig } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "Draft", color: "default" },
  2: { label: "Active", color: "green" },
  3: { label: "Inactive", color: "red" },
};

export const ListProposalConfig = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IProposalConfig>({
    resource: "proposal-configs",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "proposal-configs", ids });
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
          <CanAccess resource="proposal-configs" action="create">
            <Button onClick={() => create("proposal-configs")}>Create</Button>
          </CanAccess>
          <CanAccess resource="proposal-configs" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="proposal-configs" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="Code" title="Code" sorter defaultSortOrder={getDefaultSortOrder("Code", sorters)} defaultFilteredValue={getDefaultFilter("Code", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search Code" /></FilterDropdown>)} />
        <Table.Column dataIndex="Name" title="Name" sorter defaultSortOrder={getDefaultSortOrder("Name", sorters)} defaultFilteredValue={getDefaultFilter("Name", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search Name" /></FilterDropdown>)} />
        <Table.Column dataIndex="EffectiveDate" title="Effective Date" render={(value) => <DateField format="LL" value={value} />} sorter defaultSortOrder={getDefaultSortOrder("EffectiveDate", sorters)} />
        <Table.Column dataIndex="Status" title="Status" render={(value: number) => <Tag color={statusMap[value]?.color}>{statusMap[value]?.label || value}</Tag>} sorter defaultSortOrder={getDefaultSortOrder("Status", sorters)} />
        <Table.Column title="Actions" render={(_, record: IProposalConfig) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
