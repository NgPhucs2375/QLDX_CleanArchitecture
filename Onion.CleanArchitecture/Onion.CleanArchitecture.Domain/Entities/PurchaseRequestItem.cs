using System;
using System.Text.Json.Serialization;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestItem : AuditableBaseEntity
    {
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }

        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductUnit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }

        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }

        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }

        [JsonIgnore]
        public virtual PurchaseRequestCategory RequestCategory { get; set; } = null!;
    }
}