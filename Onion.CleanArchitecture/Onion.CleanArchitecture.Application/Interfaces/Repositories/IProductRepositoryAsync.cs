using Onion.CleanArchitecture.Application.Features.Products.Queries.GetAllProducts;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public class ProductSnapshot
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
    }

    public interface IProductRepositoryAsync : IGenericRepositoryAsync<Product>
    {
        Task<bool> IsUniqueCodeAsync(string Code);
        Task<int> DeleteRangeAsync(List<int> ids);
        Task<PagedList<Product>> GetPagedProductsAsync(GetAllProductsParameter parameter);
        Task<List<Product>> GetByCategoryIdAsync(int categoryId);
        Task<List<Product>> GetByIdsAsync(List<int> ids);
        Task<List<ProductSnapshot>> GetSnapshotsAsync(List<int> ids);
    }
}
