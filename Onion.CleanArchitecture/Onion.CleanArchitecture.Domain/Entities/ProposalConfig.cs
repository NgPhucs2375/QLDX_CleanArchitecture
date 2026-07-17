using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities{
    public class ProposalConfig : AuditableBaseEntity
    {
        // Mã cấu hình
        public string Code { get; set; } = string.Empty; // Mã cấu hình
        // Tên cấu hình
        public string Name { get; set; } = string.Empty; // Tên cấu hình
        // Ngày hiệu lực
        public DateTime EffectiveDate { get; set; } // Ngày hiệu lực
        
        // Trạng thái cấu hình
        public ConfigurationStatus Status { get; set; } = ConfigurationStatus.Draft;

        // --- NHÓM ĐIỀU HƯỚNG ---
        // Một cấu hình có thể bao gồm nhiều Danh mục và nhiều Nhân sự duyệt
        // Danh mục cấu hình được phép sử dụng 
        public virtual ICollection<ConfigCategory> ConfigCategories { get; set; } = new List<ConfigCategory>();
        // Danh sách nhân sự duyệt cấu hình
        public virtual ICollection<ConfigApprover> ConfigApprovers { get; set; } = new List<ConfigApprover>();
    
    }
}