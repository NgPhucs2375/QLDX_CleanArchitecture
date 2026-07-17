using System;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class ConfigApprover : AuditableBaseEntity
    {
        // --- NHÓM KHÓA NGOẠI ---
        // là Cấu hình mà nhân dự được phép phê duyệt

        public int ProposalConfigId { get; set; }
        // là Đơn vị mà nhân sự được phép phê duyệt

        public int DepartmentId { get; set; }
        // là Nhân sự được phép phê duyệt

        public string ApproverId { get; set; } = string.Empty;

        // Enum Cấp phê duyệt
        // Cấp phê duyệt của nhân sự trong cấu hình đề xuất
        public ApprovalLevel Level { get; set; } 

        // --- NHÓM ĐIỀU HƯỚNG ---
        // liên kết tới Cấu hình mà nhân sự được phép phê duyệt
        public virtual ProposalConfig ProposalConfig { get; set; } = null!;
        public virtual Department Department { get; set; } = null!;
    }
}