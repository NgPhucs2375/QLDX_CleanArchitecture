export interface IPurchaseRequest {
  Id: number;
  Code: string;
  DepartmentId: string;
  ProposalConfigId: string;
  Status: number;
  TotalProposedAmount: number;
  TotalActualAmount: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
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
  role: string;
  stepOrder: number;
}

export interface ICascadeCreateData {
  categories: ICascadeCategory[];
  approvers: ICascadeApprover[];
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
  productId: number;
  proposedQuantity: number;
}

export interface ICreateCategory {
  categoryId: number;
  items: ICreateItem[];
}

export interface ICreatePayload {
  code: string;
  departmentId: number;
  proposalConfigId: number;
  categories: ICreateCategory[];
}

export interface ISelectedItem {
  productId: number;
  productName: string;
  unitPrice: number;
  unit: string;
  proposedQuantity: number;
  rowId: string;
}

export interface ISelectedCategory {
  categoryId: number;
  categoryName: string;
  allowedQuota: number;
  items: ISelectedItem[];
}
