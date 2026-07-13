import {
  useTable, List, ShowButton, EditButton, DeleteButton,
  getDefaultSortOrder, FilterDropdown,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Tag } from "antd";
import { IConfigApprover } from "./types";
import { getDefaultFilter, useNavigation, useDeleteMany, CanAccess } from "@refinedev/core";
import React from "react";
import { PaginationTotal } from "@components/pagination-total";

const levelMap: Record<number, { label: string; color: string }> = {
  1: { label: "Department", color: "blue" },
  2: { label: "Control", color: "purple" },
};

export const ListConfigApprover = () => {
  const { mutate: deleteMutate } = useDeleteMany();
  const { tableProps, sorters, filters } = useTable<IConfigApprover>({
    resource: "config-approvers",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Id", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { create } = useNavigation();

  const handleDelete = () => {
    const ids = selectedRowKeys.map((key) => key.toString());
    deleteMutate({ resource: "config-approvers", ids });
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
          <CanAccess resource="config-approvers" action="create">
            <Button onClick={() => create("config-approvers")}>Create</Button>
          </CanAccess>
          <CanAccess resource="config-approvers" action="delete">
            <Button disabled={selectedRowKeys.length === 0} onClick={() => handleDelete()}>
              Delete range {selectedRowKeys.length}
            </Button>
          </CanAccess>
        </>
      }
    >
      <Table {...tableProps} rowKey="Id" pagination={{ ...tableProps.pagination, showTotal: (total) => <PaginationTotal total={total} entityName="config-approvers" /> }} rowSelection={rowSelection}>
        <Table.Column dataIndex="Id" title="ID" sorter defaultSortOrder={getDefaultSortOrder("Id", sorters)} />
        <Table.Column dataIndex="ProposalConfigId" title="Proposal Config ID" sorter defaultFilteredValue={getDefaultFilter("ProposalConfigId", filters)} filterDropdown={(props) => (<FilterDropdown {...props}><Input placeholder="Search" /></FilterDropdown>)} />
        <Table.Column dataIndex="DepartmentId" title="Department ID" sorter />
        <Table.Column dataIndex="ApproverId" title="Approver ID" sorter />
        <Table.Column dataIndex="Level" title="Level" render={(value: number) => <Tag color={levelMap[value]?.color}>{levelMap[value]?.label || value}</Tag>} sorter />
        <Table.Column title="Actions" render={(_, record: IConfigApprover) => (<Space><ShowButton hideText size="small" recordItemId={record.Id} /><EditButton hideText size="small" recordItemId={record.Id} /><DeleteButton hideText size="small" recordItemId={record.Id} /></Space>)} />
      </Table>
    </List>
  );
};
