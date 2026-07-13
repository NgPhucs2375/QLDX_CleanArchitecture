using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities{
    public class ProposalConfig : AuditableBaseEntity
    {
        public string Code { get; set; } = string.Empty; // Mã cấu hình
        public string Name { get; set; } = string.Empty; // Tên cấu hình
        public DateTime EffectiveDate { get; set; } // Ngày hiệu lực
        
        public ConfigurationStatus Status { get; set; } = ConfigurationStatus.Draft;

        // --- NHÓM ĐIỀU HƯỚNG ---
        // Một cấu hình có thể bao gồm nhiều Danh mục và nhiều Nhân sự duyệt
        public virtual ICollection<ConfigCategory> ConfigCategories { get; set; } = new List<ConfigCategory>();
        public virtual ICollection<ConfigApprover> ConfigApprovers { get; set; } = new List<ConfigApprover>();
    
    }
}