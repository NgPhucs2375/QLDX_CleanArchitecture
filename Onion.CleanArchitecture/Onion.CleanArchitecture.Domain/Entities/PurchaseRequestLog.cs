using System;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestLog : AuditableBaseEntity
    {
        // Khóa ngoại trỏ về Phiếu đề xuất đang bị tác động
        public int PurchaseRequestId { get; set; } 

        /// <summary>
        /// Người thao tác (Có thể dùng trực tiếp ID người dùng)
        /// Lưu ý: Thời gian thao tác đã được lưu tự động ở trường CreatedAt của BaseAuditableEntity
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Hành động đã thực hiện (VD: "Tạo phiếu", "Duyệt Bước 1", "Từ chối", "Cập nhật số lượng")
        /// </summary>
        public string Action { get; set; } = string.Empty; 

        /// <summary>
        /// Nội dung ghi chú (Lý do từ chối hoặc giải trình)
        /// </summary>
        public string Note { get; set; } = string.Empty; 

        // --- NHÓM ĐIỀU HƯỚNG ---
        public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
    }
}