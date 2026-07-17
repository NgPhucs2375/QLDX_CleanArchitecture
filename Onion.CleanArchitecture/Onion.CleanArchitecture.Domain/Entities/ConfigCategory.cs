using System;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class ConfigCategory : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        // Cấu hình 
        public int ProposalConfigId { get; set; }
        // Danh mục 
        public int CategoryId { get; set; }
        // Đơn vị áp dụng
        public int DepartmentId { get; set; }

        // --- DỮ LIỆU ĐỊNH MỨC ---
        //Định mức cho phép
        public decimal AllowedQuota { get; set; } // Định mức cho phép
        // --- NHÓM ĐIỀU HƯỚNG ---
        // Danh sách Cấu hình được phép sủ dụng
        public virtual ProposalConfig ProposalConfig { get; set; } = null!;
        // Danh sách Danh mục được phép sử dụng
        public virtual Category Category { get; set; } = null!;
        // Danh sách Đơn vị được phép sử dụng 
        public virtual Department Department { get; set; } = null!;
    }
}