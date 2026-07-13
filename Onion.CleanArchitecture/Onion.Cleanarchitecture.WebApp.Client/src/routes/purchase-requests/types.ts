export interface IPurchaseRequest {
  Id: number;
  Code: string;
  DepartmentId: string;
  PurchaseConfigId: string;
  Status: number;
  TotalProposedAmount: number;
  TotalActualAmount: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}
