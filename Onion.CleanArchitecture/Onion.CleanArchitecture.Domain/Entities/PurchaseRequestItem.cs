using System;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestItem : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        public int PurchaseRequestCategoryId { get; set; } // Trỏ về Danh mục của Phiếu
        public int ProductId { get; set; } // Trỏ về Sản phẩm

        public decimal UnitPrice { get; set; } // Đơn giá (Snapshot copy từ Product sang)

        // --- KẾT QUẢ ĐỀ XUẤT (Lúc tạo phiếu) ---
        public int ProposedQuantity { get; set; } // Số lượng đề xuất
        public decimal TotalAmount { get; set; } // Thành tiền đề xuất = ProposedQuantity * UnitPrice

        // --- KẾT QUẢ THỰC TẾ (Lúc nhận hàng) ---
        public int ActualQuantity { get; set; } // Số lượng thực tế
        public decimal ActualTotalAmount { get; set; } // Thành tiền thực tế = ActualQuantity * UnitPrice

        // --- NHÓM ĐIỀU HƯỚNG ---
        public virtual PurchaseRequestCategory RequestCategory { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}