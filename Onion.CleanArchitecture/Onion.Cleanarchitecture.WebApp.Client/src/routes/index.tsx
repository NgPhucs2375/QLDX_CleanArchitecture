///<summary>
/// Màn hình chính của hệ thống, nơi người dùng có thể truy cập các chức năng và thông tin quan trọng.
///</summary>

// --- HỆ THỐNG & TỔNG QUAN ---
export * from "./dashboards";
export * from "./identity";
export * from "./roles";
export * from "./roleclaims";
export * from "./authens";
export * from "./departments";

// --- QUẢN LÝ DANH MỤC & SẢN PHẨM ---
export * from "./categories";
export * from "./products";

// --- QUẢN LÝ CẤU HÌNH (CONFIG) ---
export * from "./proposal-configs";
export * from "./config-categories";
export * from "./config-approvers";

// --- QUẢN LÝ PHIẾU ĐỀ XUẤT MUA HÀNG (PURCHASE REQUEST) ---
export * from "./purchase-requests";
export * from "./purchase-request-categories";
export * from "./purchase-request-items";
export * from "./purchase-request-logs";

// --- CÁC MODULE KHÁC ---
export * from "./investors";