using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems
{
    public class GetAllPurchaseRequestItemsViewModel
    {
        public int Id { get; set; }
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }
    }
}
