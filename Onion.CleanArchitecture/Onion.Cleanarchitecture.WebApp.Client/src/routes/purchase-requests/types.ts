import { PurchaseRequestStatus } from "./constants/enums";

export interface IPurchaseRequest {
  Id: number;
  Code: string;
  DepartmentId: number;
  ProposalConfigId: number;
  Status: PurchaseRequestStatus;
  TotalProposedAmount: number;
  TotalActualAmount: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
  Approvals?: IPurchaseRequestApproval[];
  Approvers?: IPurchaseRequestApprover[];
}

export interface IPurchaseRequestApproval {
  Id: number;
  PurchaseRequestId: number;
  ApproverId: string;
  ApproverName: string;
  FromStatus: number;
  ToStatus: number;
  Action: string;
  Note: string;
  Created: string;
}

export interface IPurchaseRequestApprover {
  Id: number;
  PurchaseRequestId: number;
  ApproverId: string;
  ApproverName: string;
  Role: number;
  StepOrder: number;
  Status: number;
}

export interface ICascadeCategory {
  configCategoryId: number;
  categoryId: number;
  categoryName: string;
  allowedQuota: number;
  remainingAmount: number;
}

export interface ICascadeApprover {
  approverId: string;
  approverName: string;
  role: string;
  stepOrder: number;
}

export interface ICascadeDepartmentHead {
  approverId: string;
  approverName: string;
}

export interface ICascadeCreateData {
  categories: ICascadeCategory[];
  approvers: ICascadeApprover[];
  departmentHeads: ICascadeDepartmentHead[];
  departmentManagerId: string;
}

export interface ICascadeProduct {
  id: number;
  code: string;
  name: string;
  unitPrice: number;
  unit: string;
}

export interface ICreateItem {
  ProductId: number;
  ProposedQuantity: number;
  Note?: string;
}

export interface ICreateCategory {
  CategoryId: number;
  Items: ICreateItem[];
}

export interface ICreatePayload {
  Code: string;
  DepartmentId: number;
  ProposalConfigId: number;
  ApproverId: string;
  Reason?: string;
  ContactName?: string;
  ContactPhone?: string;
  ShippingAddress?: string;
  Categories: ICreateCategory[];
}

export interface ISelectedItem {
  productId: number;
  productName: string;
  unitPrice: number;
  unit: string;
  proposedQuantity: number;
  rowId: string;
}

export interface IFormItem extends ISelectedItem {
  id?: number;
  note: string;
}

export interface ISelectedCategory {
  categoryId: number;
  categoryName: string;
  allowedQuota: number;
  items: IFormItem[];
}

export interface ILocalItem {
  Id: number;
  ProductId: number;
  ProductName: string;
  ProposedQuantity: number;
  UnitPrice: number;
  TotalAmount: number;
  ActualQuantity: number;
  Product?: { Name: string; Code: string; Unit: string };
}

export interface ILocalCategory {
  Id: number;
  CategoryId: number;
  Name: string;
  AllowedQuota: number;
  RequestItems: ILocalItem[];
  Category?: { Name: string; AllowedQuota: number };
}

export interface ILocalPurchaseRequest extends IPurchaseRequest {
  Reason: string;
  ContactName: string;
  ContactPhone: string;
  ShippingAddress: string;
  RequestCategories: ILocalCategory[];
}
// export enum StatusEnum {
//   Draft = 0,
//   PendingApproval = 1,
//   Approved = 2,
//   Rejected = 3,
//   ReturnedForEdit = 4,
//   OrderCompleted = 5
// }
// export const listStatus.find(i => i.value == phieu.Status)?.label = [
//   {
//     value: StatusEnum.Draft,
//     label: "Chưa gửi duyệt",
//     color: "blue"
//   }
// ]