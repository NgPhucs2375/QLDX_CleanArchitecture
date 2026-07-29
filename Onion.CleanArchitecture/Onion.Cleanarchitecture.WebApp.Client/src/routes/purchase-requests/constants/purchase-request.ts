import { PurchaseRequestStatus, ApproverStatus } from "./enums";

export interface StatusConfig {
  label: string;
  color: string;
}

export const STATUS_CONFIG: Record<PurchaseRequestStatus, StatusConfig> = {
  [PurchaseRequestStatus.Draft]:             { label: "Bản nháp", color: "default" },
  [PurchaseRequestStatus.PendingDepartment]: { label: "Chờ Trưởng đơn vị duyệt", color: "processing" },
  [PurchaseRequestStatus.PendingControl]:    { label: "Chờ Kiểm soát duyệt", color: "geekblue" },
  [PurchaseRequestStatus.ReturnedForEdit]:   { label: "Trả về chỉnh sửa", color: "warning" },
  [PurchaseRequestStatus.PendingOrderConfirm]: { label: "Chờ xác nhận đơn hàng", color: "purple" },
  [PurchaseRequestStatus.Completed]:         { label: "Hoàn thành", color: "success" },
  [PurchaseRequestStatus.RejectedByDepartment]: { label: "Đơn vị từ chối", color: "error" },
  [PurchaseRequestStatus.RejectedByControl]: { label: "Kiểm soát từ chối", color: "error" },
};

export const APPROVER_STATUS_CONFIG: Record<ApproverStatus, StatusConfig> = {
  [ApproverStatus.Waiting]:  { label: "Chờ", color: "default" },
  [ApproverStatus.Pending]:  { label: "Đang chờ xử lý", color: "processing" },
  [ApproverStatus.Approved]: { label: "Đã duyệt", color: "success" },
  [ApproverStatus.Rejected]: { label: "Từ chối", color: "error" },
  [ApproverStatus.Bypassed]: { label: "Bỏ qua", color: "warning" },
};

export interface ActionEndpointConfig {
  label: string;
  color: string;
  beAction: string;
  danger?: boolean;
}

export const ACTION_ENDPOINT_CONFIG: Record<string, ActionEndpointConfig> = {
  submit:             { label: "Gửi duyệt", color: "geekblue", beAction: "submit" },
  "approve-department": { label: "Duyệt", color: "success", beAction: "approve" },
  approve:            { label: "Phê duyệt", color: "success", beAction: "approve" },
  reject:             { label: "Từ chối", color: "error", beAction: "reject", danger: true },
  "return-for-edit":  { label: "Trả về chỉnh sửa", color: "warning", beAction: "return" },
  "confirm-order":    { label: "Hoàn tất đơn hàng", color: "purple", beAction: "confirm" },
};

export const APPROVAL_ACTION_CONFIG: Record<string, StatusConfig> = {
  "Gửi phiếu":            { label: "Gửi phiếu", color: "geekblue" },
  "Duyệt cấp đơn vị":     { label: "Duyệt", color: "success" },
  "Duyệt kiểm soát":      { label: "Phê duyệt", color: "success" },
  "Từ chối":              { label: "Từ chối", color: "error" },
  "Trả chỉnh sửa":        { label: "Trả về", color: "warning" },
  "Xác nhận đơn hàng":    { label: "Hoàn tất", color: "purple" },
  "Cập nhật phiếu":       { label: "Cập nhật", color: "default" },
};

export const BE_ACTION_CONFIG: Record<string, StatusConfig> = {
  submit:  { label: "Gửi phiếu", color: "geekblue" },
  approve: { label: "Duyệt", color: "success" },
  reject:  { label: "Từ chối", color: "error" },
  return:  { label: "Trả về", color: "warning" },
  confirm: { label: "Hoàn tất", color: "purple" },
};

export function getStatusConfig(status: PurchaseRequestStatus): StatusConfig {
  return STATUS_CONFIG[status] ?? { label: `Không xác định (${status})`, color: "default" };
}

export function getApproverStatusConfig(status: ApproverStatus): StatusConfig {
  return APPROVER_STATUS_CONFIG[status] ?? { label: `Không xác định (${status})`, color: "default" };
}

export function getActionDisplay(action: string): StatusConfig {
  return APPROVAL_ACTION_CONFIG[action] ?? BE_ACTION_CONFIG[action] ?? { label: action, color: "default" };
}
