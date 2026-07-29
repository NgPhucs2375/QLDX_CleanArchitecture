export enum PurchaseRequestStatus {
  Draft = 1,
  PendingDepartment = 2,
  PendingControl = 3,
  ReturnedForEdit = 4,
  PendingOrderConfirm = 5,
  Completed = 6,
  RejectedByDepartment = 7,
  RejectedByControl = 8,
}

export enum ApproverStatus {
  Waiting = 0, Pending = 1, Approved = 2, Rejected = 3, Bypassed = 4,
}

export enum PurchaseRequestTrigger {
  Submit = 1,
  ApproveDepartment = 2,
  Reject = 3,
  ReturnForEdit = 4,
  Approve = 5,
  ConfirmOrder = 6,
  Update = 7,
}

export enum ApprovalLevel { CreatorLevel = 0, DepartmentLevel = 1, ControlLevel = 2 }