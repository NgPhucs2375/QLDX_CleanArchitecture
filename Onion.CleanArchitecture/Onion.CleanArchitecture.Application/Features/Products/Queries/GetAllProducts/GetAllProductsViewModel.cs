using System;

namespace Onion.CleanArchitecture.Application.Features.Products.Queries.GetAllProducts
{
    public class GetAllProductsViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public decimal UnitPrice { get; set; }
        public string Unit { get; set; }
        public bool IsActive { get; set; }
    }
}
