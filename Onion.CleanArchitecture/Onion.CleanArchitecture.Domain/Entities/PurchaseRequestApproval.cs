using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestApproval : AuditableBaseEntity
    {
        public int PurchaseRequestId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public string ApproverName { get; set; } = string.Empty;
        public PurchaseRequestStatus FromStatus { get; set; }
        public PurchaseRequestStatus ToStatus { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;

        public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
    }
}
