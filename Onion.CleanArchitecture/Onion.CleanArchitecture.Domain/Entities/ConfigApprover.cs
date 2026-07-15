using System;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class ConfigApprover : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        public int ProposalConfigId { get; set; }
        public int DepartmentId { get; set; }
        public string ApproverId { get; set; } = string.Empty;

        // Enum Cấp phê duyệt
        public ApprovalLevel Level { get; set; } 

        // --- NHÓM ĐIỀU HƯỚNG ---
        public virtual ProposalConfig ProposalConfig { get; set; } = null!;
        public virtual Department Department { get; set; } = null!;
    }
}