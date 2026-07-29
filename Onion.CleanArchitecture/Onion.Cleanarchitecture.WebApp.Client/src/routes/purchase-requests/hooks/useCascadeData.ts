import { useState, useCallback } from "react";
import { dataProvider } from "../../../providers/data-provider";
import type { ICascadeCreateData, ICascadeProduct } from "../types";

export interface UseCascadeDataReturn {
  cascadeData: ICascadeCreateData;
  loadingCascade: boolean;
  loadingCategories: Record<number, boolean>;
  productsCache: Record<number, ICascadeProduct[]>;
  loadCascade: (configId: number, deptId: number) => Promise<void>;
  loadProducts: (catId: number) => Promise<ICascadeProduct[]>;
  clearCascade: () => void;
}

export function useCascadeData(): UseCascadeDataReturn {
  const [cascadeData, setCascadeData] = useState<ICascadeCreateData>({
    categories: [], approvers: [], departmentHeads: [], departmentManagerId: "",
  });
  const [loadingCascade, setLoadingCascade] = useState(false);
  const [productsCache, setProductsCache] = useState<Record<number, ICascadeProduct[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({});

  const deduplicateCategories = (cats: ICascadeCreateData["categories"]) =>
    cats.filter((cat, index, self) => index === self.findIndex((c) => c.categoryId === cat.categoryId));

  const deduplicateProducts = (prods: ICascadeProduct[]) =>
    prods.filter((prod, index, self) => index === self.findIndex((p) => p.id === prod.id));

  const loadCascade = useCallback(async (configId: number, deptId: number) => {
    console.log("loadCascade start", { configId, deptId });
    setLoadingCascade(true);
    try {
      const result = await dataProvider.custom({
        url: `/api/purchase-requests/cascade-create?ProposalConfigId=${configId}&DepartmentId=${deptId}`,
        method: "get",
      });
      console.log("loadCascade result", result);
      const apiData = (result.data ?? {}) as any;
      
      // Map PascalCase from C# API to camelCase expected by TS types & React UI
      const data: ICascadeCreateData = {
        categories: (apiData.Categories ?? apiData.categories ?? []).map((c: any) => ({
          configCategoryId: c.ConfigCategoryId ?? c.configCategoryId,
          categoryId: c.CategoryId ?? c.categoryId,
          categoryName: c.CategoryName ?? c.categoryName,
          allowedQuota: c.AllowedQuota ?? c.allowedQuota,
          remainingAmount: c.RemainingAmount ?? c.remainingAmount,
        })),
        approvers: (apiData.Approvers ?? apiData.approvers ?? []).map((a: any) => ({
          approverId: a.ApproverId ?? a.approverId,
          approverName: a.ApproverName ?? a.approverName,
          role: a.Role ?? a.role,
          stepOrder: a.StepOrder ?? a.stepOrder,
        })),
        departmentHeads: (apiData.DepartmentHeads ?? apiData.departmentHeads ?? []).map((d: any) => ({
          approverId: d.ApproverId ?? d.approverId,
          approverName: d.ApproverName ?? d.approverName,
        })),
        departmentManagerId: apiData.DepartmentManagerId ?? apiData.departmentManagerId ?? "",
      };
      
      console.log("loadCascade data processed (mapped)", data);
      setCascadeData({
        ...data,
        categories: deduplicateCategories(data.categories),
      });
    } catch (err) {
      console.error("loadCascade error:", err);
      setCascadeData({ categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" });
      throw err;
    } finally {
      setLoadingCascade(false);
    }
  }, []);

  const loadProducts = useCallback(async (catId: number): Promise<ICascadeProduct[]> => {
    setLoadingCategories((prev) => ({ ...prev, [catId]: true }));
    try {
      if (productsCache[catId]) return productsCache[catId];
      const result = await dataProvider.custom({
        url: `/api/purchase-requests/cascade-products?CategoryId=${catId}`,
        method: "get",
      });
      
      const apiList = (result.data ?? []) as any[];
      const list: ICascadeProduct[] = apiList.map((p: any) => ({
        id: p.Id ?? p.id,
        code: p.Code ?? p.code,
        name: p.Name ?? p.name,
        unitPrice: p.UnitPrice ?? p.unitPrice,
        unit: p.Unit ?? p.unit,
      }));
      
      const deduplicated = deduplicateProducts(list);
      setProductsCache((prev) => ({ ...prev, [catId]: deduplicated }));
      return deduplicated;
    } catch (err) {
      console.error("loadProducts error:", err);
      return [];
    } finally {
      setLoadingCategories((prev) => ({ ...prev, [catId]: false }));
    }
  }, [productsCache]);

  const clearCascade = useCallback(() => {
    setCascadeData({ categories: [], approvers: [], departmentHeads: [], departmentManagerId: "" });
    setProductsCache({});
  }, []);

  return {
    cascadeData,
    loadingCascade,
    loadingCategories,
    productsCache,
    loadCascade,
    loadProducts,
    clearCascade,
  };
}
