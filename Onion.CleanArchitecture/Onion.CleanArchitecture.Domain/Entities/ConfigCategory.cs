using System;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class ConfigCategory : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        public Guid ProposalConfigId { get; set; } // Trỏ về Cấu hình chung
        public Guid CategoryId { get; set; } // Trỏ về Danh mục sản phẩm Master Data
        public Guid DepartmentId { get; set; } // Đơn vị áp dụng

        // --- DỮ LIỆU ĐỊNH MỨC ---
        public decimal AllowedQuota { get; set; } // Định mức cho phép
        public decimal UsedAmount { get; set; } // Số tiền đã sử dụng
        public decimal RemainingAmount { get; set; } // Số tiền còn lại
        // --- NHÓM ĐIỀU HƯỚNG ---
        public virtual ProposalConfig ProposalConfig { get; set; } = null!;
        public virtual Category Category { get; set; } = null!;
        public virtual Department Department { get; set; } = null!;
    }
}