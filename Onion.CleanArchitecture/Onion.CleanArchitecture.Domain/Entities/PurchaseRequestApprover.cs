using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestApprover : AuditableBaseEntity
    {
        public int PurchaseRequestId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public string ApproverName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int StepOrder { get; set; }

        public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
    }
}
