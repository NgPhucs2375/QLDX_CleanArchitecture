export interface IPurchaseRequestItem {
  Id: number;
  PurchaseRequestCategoryId: string;
  ProductId: string;
  UnitPrice: number;
  ProposedQuantity: number;
  TotalAmount: number;
  ActualQuantity: number;
  ActualTotalAmount: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}
