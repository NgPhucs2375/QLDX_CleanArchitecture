namespace Onion.CleanArchitecture.Domain.Enums
{
    public enum ApprovalLevel
    {
        /// <summary>
        /// Bước 0 – Người tạo phiếu (Do Người tạo phiếu xử lý)
        /// </summary>
        CreatorLevel = 0,
        /// <summary>
        /// Bước 1 – Duyệt cấp đơn vị (Do Trưởng đơn vị xử lý)
        /// </summary>
        DepartmentLevel = 1,

        /// <summary>
        /// Bước 2 – Kiểm soát (Do Nhân sự kiểm soát xử lý)
        /// </summary>
        ControlLevel = 2
    }
}