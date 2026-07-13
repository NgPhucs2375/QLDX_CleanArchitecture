using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestCategory : AuditableBaseEntity
    {
         // --- NHÓM KHÓA NGOẠI ---
        public Guid PurchaseRequestId { get; set; } // Trỏ về Phiếu đề xuất (Tầng 1)
        public Guid CategoryId { get; set; } // Trỏ về Danh mục (Master Data)

        // --- DỮ LIỆU SNAPSHOT (Lưu cứng định mức theo Bước 4 URD) ---
        /// <summary>
        /// Định mức cho phép tại thời điểm tạo phiếu (Không thay đổi dù cấu hình gốc sau này bị đổi)
        /// </summary>
        public decimal AllowedQuota { get; set; } 

        // --- KẾT QUẢ ĐỀ XUẤT (Lúc tạo phiếu) ---
        public decimal TotalProposedAmount { get; set; } // Tổng tiền sử dụng của danh mục này
        
        /// <summary>
        /// Chênh lệch = AllowedQuota - TotalProposedAmount
        /// </summary>
        public decimal Difference { get; set; } 

        // --- KẾT QUẢ THỰC TẾ (Sau khi nhận hàng) ---
        public decimal ActualTotalAmount { get; set; } // Tổng tiền thực tế sau khi nhận hàng
        
        /// <summary>
        /// Chênh lệch thực tế = AllowedQuota - ActualTotalAmount
        /// </summary>
        public decimal ActualDifference { get; set; } 

        // --- NHÓM ĐIỀU HƯỚNG (Navigation Properties) ---
        public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
        
        // 1 Danh mục trong phiếu có thể chứa nhiều Sản phẩm chi tiết (Tầng 3)
        public virtual ICollection<PurchaseRequestItem> RequestItems { get; set; } = new List<PurchaseRequestItem>();
    }
}