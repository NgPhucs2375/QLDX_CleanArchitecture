export interface IInvestor {
  Id: number;
  Title: string;
  Category: number;
  Delay: number;
  Year: number;
  Month: number;
  Quarter: number;
  FileUrl: string;
  Created: string;
  CreatedBy: string;
}

export interface IUser {
  Id: string;
  UserName: string;
  Email: string;
}