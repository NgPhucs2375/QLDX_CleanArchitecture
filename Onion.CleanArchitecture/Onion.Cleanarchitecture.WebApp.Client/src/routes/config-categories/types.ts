export interface IConfigCategory {
  Id: number;
  ProposalConfigId: number;
  CategoryId: number;
  DepartmentId: number;
  AllowedQuota: number;
  UsedAmount: number;
  RemainingAmount: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}
