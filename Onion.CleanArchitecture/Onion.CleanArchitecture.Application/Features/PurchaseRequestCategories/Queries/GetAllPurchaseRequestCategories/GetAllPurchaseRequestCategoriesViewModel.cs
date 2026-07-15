using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetAllPurchaseRequestCategories
{
    public class GetAllPurchaseRequestCategoriesViewModel
    {
        public int Id { get; set; }
        public int PurchaseRequestId { get; set; }
        public int CategoryId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal Difference { get; set; }
        public decimal ActualTotalAmount { get; set; }
        public decimal ActualDifference { get; set; }
    }
}
