export interface IDepartment {
  Id: number;
  Code: string;
  Name: string;
  ManagerId: string | null;
  IsActive: boolean;
  CreatedBy: string;
  Created: string;
  LastModifiedBy: string;
  LastModified: string;
}

export interface IUser {
  Id: string;
  UserName: string;
  Email: string;
}