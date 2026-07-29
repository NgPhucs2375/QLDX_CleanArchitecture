import { useState, useMemo } from "react";
import { useTable, getDefaultSortOrder, getDefaultFilter } from "@refinedev/antd";
import { useDeleteMany, useMany, useNavigation } from "@refinedev/core";
import type { CrudFilters, CrudSorting } from "@refinedev/core";
import type { IPurchaseRequest } from "../types";

export interface UsePurchaseRequestListReturn {
  tableProps: ReturnType<typeof useTable<IPurchaseRequest>>["tableProps"];
  sorters: CrudSorting | undefined;
  filters: CrudFilters | undefined;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  handleDelete: () => void;
  usersData: Record<string, unknown>[] | undefined;
  createdByIds: string[];
  navigateToCreate: () => void;
}

export function usePurchaseRequestList(): UsePurchaseRequestListReturn {
  const { mutate: deleteMutate } = useDeleteMany();
  const { create } = useNavigation();

  const { tableProps, sorters, filters } = useTable<IPurchaseRequest>({
    resource: "purchase-requests",
    pagination: { current: 1, pageSize: 10 },
    sorters: { initial: [{ field: "Created", order: "desc" }] },
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const createdByIds = useMemo(
    () => [
      ...new Set(
        (tableProps.dataSource ?? [])
          .map((r) => (r as IPurchaseRequest).CreatedBy)
          .filter(Boolean)
      ),
    ],
    [tableProps.dataSource]
  );

  const { data: userResponse } = useMany({
    resource: "users",
    ids: createdByIds,
    queryOptions: { enabled: createdByIds.length > 0 },
  });

  const usersData = (userResponse?.data ?? []) as Record<string, unknown>[];

  const handleDelete = () => {
    deleteMutate({
      resource: "purchase-requests",
      ids: selectedRowKeys.map((k) => k.toString()),
    });
  };

  const navigateToCreate = () => create("purchase-requests");

  return {
    tableProps,
    sorters,
    filters,
    selectedRowKeys,
    setSelectedRowKeys,
    handleDelete,
    usersData,
    createdByIds,
    navigateToCreate,
  };
}
