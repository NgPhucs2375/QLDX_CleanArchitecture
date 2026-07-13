using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems
{
    public class GetAllPurchaseRequestItemsViewModel
    {
        public int Id { get; set; }
        public Guid PurchaseRequestCategoryId { get; set; }
        public Guid ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }
    }
}
