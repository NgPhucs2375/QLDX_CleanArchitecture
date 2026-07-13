using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems;
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
    public class PurchaseRequestItemRepositoryAsync : GenericRepositoryAsync<PurchaseRequestItem>, IPurchaseRequestItemRepositoryAsync
    {
        private readonly DbSet<PurchaseRequestItem> _entities;

        public PurchaseRequestItemRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _entities = dbContext.Set<PurchaseRequestItem>();
        }

        public async Task<PagedList<PurchaseRequestItem>> GetPagedPurchaseRequestItemsAsync(GetAllPurchaseRequestItemsParameter request)
        {
            var query = _entities.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<PurchaseRequestItem>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
    }
}
