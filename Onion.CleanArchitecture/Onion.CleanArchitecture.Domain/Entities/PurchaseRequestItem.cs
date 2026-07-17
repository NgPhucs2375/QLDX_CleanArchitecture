using System;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestItem : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }

        // --- SNAPSHOT THÔNG TIN SẢN PHẨM TẠI THỜI ĐIỂM TẠO PHIẾU ---
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductUnit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }

        // --- KẾT QUẢ ĐỀ XUẤT ---
        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }

        // --- KẾT QUẢ THỰC TẾ (Lúc nhận hàng) ---
        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }

        // --- NHÓM ĐIỀU HƯỚNG ---
        public virtual PurchaseRequestCategory RequestCategory { get; set; } = null!;
    }
}