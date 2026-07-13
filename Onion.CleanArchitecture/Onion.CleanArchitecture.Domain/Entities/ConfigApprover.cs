using System;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class ConfigApprover : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        public Guid ProposalConfigId { get; set; }
        public Guid DepartmentId { get; set; } // Đơn vị
        public Guid ApproverId { get; set; } // Nhân sự xử lý (Trỏ về User)

        // Enum Cấp phê duyệt
        public ApprovalLevel Level { get; set; } 

        // --- NHÓM ĐIỀU HƯỚNG ---
        public virtual ProposalConfig ProposalConfig { get; set; } = null!;
        public virtual Department Department { get; set; } = null!;
    }
}