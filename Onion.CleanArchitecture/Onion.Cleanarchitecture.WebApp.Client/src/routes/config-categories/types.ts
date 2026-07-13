export interface IConfigCategory {
  Id: number;
  ProposalConfigId: string;
  CategoryId: string;
  DepartmentId: string;
  AllowedQuota: number;
  UsedAmount: number;
  RemainingAmount: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}
