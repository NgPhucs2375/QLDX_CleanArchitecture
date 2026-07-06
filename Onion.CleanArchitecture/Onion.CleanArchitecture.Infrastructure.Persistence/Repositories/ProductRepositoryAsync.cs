using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.Products.Queries.GetAllProducts;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
using Onion.CleanArchitecture.Infrastructure.Persistence.Repository;
using Onion.CleanArchitecture.Infrastructure.Shared.Extensions;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Repositories
{
    public class ProductRepositoryAsync : GenericRepositoryAsync<Product>, IProductRepositoryAsync
    {
        private readonly DbSet<Product> _products;

        public ProductRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _products = dbContext.Set<Product>();
        }

        public Task<bool> IsUniqueBarcodeAsync(string barcode)
        {
            return _products
                .AllAsync(p => p.Barcode != barcode);
        }

        public async Task<int> DeleteRangeAsync(List<int> ids)
        {
            var products = await _products.Where(p => ids.Contains(p.Id)).ToListAsync();
            _products.RemoveRange(products);
            return products.Count;
        }

        public async Task<PagedList<Product>> GetPagedProductsAsync(GetAllProductsParameter request)
        {
            var productQuery = _products.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                productQuery = MethodExtensions.ApplyFilters(productQuery, request._filter);
            }

            return await PagedList<Product>.ToPagedList(productQuery.OrderByDynamic(request._sort, request._order).AsNoTracking(), request._start, request._end);
        }
    }
}
