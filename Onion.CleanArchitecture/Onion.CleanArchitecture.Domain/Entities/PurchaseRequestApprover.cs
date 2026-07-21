using System.Text.Json.Serialization;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestApprover : AuditableBaseEntity
    {
        public int PurchaseRequestId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public string ApproverName { get; set; } = string.Empty;
        public PDXROLE Role { get; set; } 
        public int StepOrder { get; set; }

        public ApproverStatus Status { get; set; } = ApproverStatus.Waiting;

        [JsonIgnore]
        public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
    }
}
