using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequest : AuditableBaseEntity
    {
        public string Code { get; set;}  = string.Empty;
        public int DepartmentId { get; set; }
        public int ProposalConfigId { get; set; }

        public decimal TotalProposedAmount { get; set; }
        public decimal TotalActualAmount { get; set; }

        public string? Reason { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? ShippingAddress { get; set; }
        public string? Note { get; set; }

        public virtual ICollection<PurchaseRequestCategory> RequestCategories { get; set; } = new List<PurchaseRequestCategory>();
        public virtual ICollection<PurchaseRequestApproval> Approvals { get; set; } = new List<PurchaseRequestApproval>();
        public virtual ICollection<PurchaseRequestApprover> Approvers { get; set; } = new List<PurchaseRequestApprover>();
    }
}