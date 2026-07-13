using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequest : AuditableBaseEntity
    {
        public string Code { get; set;}  = string.Empty;
        // Reference Key : Department and PurchaseConfig
        public Guid DepartmentId { get; set; }
        public Guid PurchaseConfigId { get; set; }

        // Enums Status 
        public PurchaseRequestStatus Status { get; set; } = PurchaseRequestStatus.Draft;
        public decimal TotalProposedAmount { get; set; } 
        public decimal TotalActualAmount { get; set; }

        // Navigation

        public virtual ICollection<PurchaseRequestCategory> RequestCategories { get; set; } = new List<PurchaseRequestCategory>();

    }
}