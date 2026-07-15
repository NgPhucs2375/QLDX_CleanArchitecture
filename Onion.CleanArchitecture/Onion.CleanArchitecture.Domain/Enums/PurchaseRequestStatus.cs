namespace Onion.CleanArchitecture.Domain.Enums
{
    public enum PurchaseRequestStatus
    {
        /// <summary>
        /// Nháp: Người dùng đang tạo
        /// </summary>
        Draft = 1,

        /// <summary>
        /// Chờ trưởng đơn vị duyệt: Chờ cấp đơn vị xử lý
        /// </summary>
        PendingDepartment = 2,

        /// <summary>
        /// Chờ kiểm soát: Chờ cấp kiểm soát xử lý
        /// </summary>
        PendingControl = 3,

        /// <summary>
        /// Trả chỉnh sửa: Phiếu bị trả về
        /// </summary>
        ReturnedForEdit = 4,

        /// <summary>
        /// Đã duyệt: Hoàn tất phê duyệt
        /// </summary>
        Approved = 5,

        /// <summary>
        /// Chờ xác nhận đơn hàng: Người tạo xác nhận
        /// </summary>
        PendingOrderConfirm = 6,

        /// <summary>
        /// Hoàn thành: Đã nhập số lượng thực tế
        /// </summary>
        Completed = 7,

        /// <summary>
        /// Từ chối bởi Trưởng đơn vị
        /// </summary>
        RejectedByDepartment = 8,

        /// <summary>
        /// Từ chối bởi Kiểm soát
        /// </summary>
        RejectedByControl = 9
    }
}