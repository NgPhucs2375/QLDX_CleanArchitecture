export interface IPurchaseRequestCategory {
  Id: number;
  PurchaseRequestId: string;
  CategoryId: string;
  AllowedQuota: number;
  TotalProposedAmount: number;
  Difference: number;
  ActualTotalAmount: number;
  ActualDifference: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}
