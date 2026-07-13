namespace Onion.CleanArchitecture.Domain.Enums
{
    public enum ConfigurationStatus
    {
        /// <summary>
        /// Nháp: Cấu hình đang được thiết lập, chưa ban hành
        /// </summary>
        Draft = 1,

        /// <summary>
        /// Đang hoạt động: Có thể sử dụng để tạo phiếu đề xuất mới
        /// </summary>
        Active = 2,

        /// <summary>
        /// Ngừng hoạt động: Đã cũ hoặc bị thay thế
        /// </summary>
        Inactive = 3
    }
}