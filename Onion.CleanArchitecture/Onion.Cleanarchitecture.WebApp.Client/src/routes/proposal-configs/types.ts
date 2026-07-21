export interface IProposalConfig {
  Id: number;
  Code: string;
  Name: string;
  EffectiveDate: string;
  Status: number;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
  Categories: { CategoryId: number; DepartmentId: number; AllowedQuota: number }[];
  Approves: { DepartmentId: number; ApproverId: string; Level?: number }[];
}

export interface ICategory {
  Id: number;
  Code: string;
  Name: string;
  IsActive: boolean;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}

export interface IDepartment {
  Id: number;
  Code: string;
  Name: string;
  ManagerId: string;
  IsActive: boolean;
}

export interface IApprovalLevel {
  value: number;
  label: string;
}

export interface IConfigCategoryItem {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  allowedQuota: number;
  periodType: number;
}

export interface IConfigApproverItem {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  approverId: string;
  approverName: string;
  email: string;
  name: string;
  level: number;
  levelLabel: string;
}

export interface IUser {
  Id: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
}

export interface IProposalConfigPayload {
  Id?: number;
  Code: string;
  Name: string;
  EffectiveDate: string;
  Status: number;
  Categories: { CategoryId: number; DepartmentId: number; AllowedQuota: number }[];
  Approves: { DepartmentId: number; ApproverId: string }[];
}
