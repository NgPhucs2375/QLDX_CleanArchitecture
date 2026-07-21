using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetAllPurchaseRequestCategories;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
using Onion.CleanArchitecture.Infrastructure.Persistence.Repository;
using Onion.CleanArchitecture.Infrastructure.Shared.Extensions;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Repositories
{
    public class PurchaseRequestCategoryRepositoryAsync : GenericRepositoryAsync<PurchaseRequestCategory>, IPurchaseRequestCategoryRepositoryAsync
    {
        private readonly DbSet<PurchaseRequestCategory> _entities;

        public PurchaseRequestCategoryRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _entities = dbContext.Set<PurchaseRequestCategory>();
        }

        public async Task<PagedList<PurchaseRequestCategory>> GetPagedPurchaseRequestCategoriesAsync(GetAllPurchaseRequestCategoriesParameter request)
        {
            var query = _entities.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<PurchaseRequestCategory>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
        public async Task<decimal> GetTotalProposedAmountByRequestIdAsync(int purchaseRequestId)
        {
            return await _entities
                .Where(x => x.PurchaseRequestId == purchaseRequestId)
                .SumAsync(x => x.TotalProposedAmount); // Lấy từ PurchaseRequestCategory
        }

        public async Task<decimal> GetTotalActualAmountByRequestIdAsync(int purchaseRequestId)
        {
            return await _entities
                .Where(x => x.PurchaseRequestId == purchaseRequestId)
                .SumAsync(x => x.ActualTotalAmount); // Lấy từ PurchaseRequestCategory
        }
    }
}
