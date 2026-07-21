using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class PurchaseRequestCategory : AuditableBaseEntity
    {
         // --- NHÓM KHÓA NGOẠI ---
        public int PurchaseRequestId { get; set; }
        public int CategoryId { get; set; }

        // --- DỮ LIỆU SNAPSHOT ---
        public decimal AllowedQuota { get; set; } 

        // --- KẾT QUẢ ĐỀ XUẤT ---
        public decimal TotalProposedAmount { get; set; }
        public decimal Difference { get; set; } 

        // --- KẾT QUẢ THỰC TẾ ---
        public decimal ActualTotalAmount { get; set; }
        public decimal ActualDifference { get; set; } 

        // --- NHÓM ĐIỀU HƯỚNG ---
        [JsonIgnore]
        public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
        
        public virtual ICollection<PurchaseRequestItem> RequestItems { get; set; } = new List<PurchaseRequestItem>();
    }
}