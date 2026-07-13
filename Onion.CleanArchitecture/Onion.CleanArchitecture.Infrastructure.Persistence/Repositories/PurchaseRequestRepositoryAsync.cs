using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
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
    public class PurchaseRequestRepositoryAsync : GenericRepositoryAsync<PurchaseRequest>, IPurchaseRequestRepositoryAsync
    {
        private readonly DbSet<PurchaseRequest> _entities;

        public PurchaseRequestRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _entities = dbContext.Set<PurchaseRequest>();
        }

        public Task<bool> IsUniqueCodeAsync(string code)
        {
            return _entities
                .AllAsync(p => p.Code != code);
        }

        public async Task<PagedList<PurchaseRequest>> GetPagedPurchaseRequestsAsync(GetAllPurchaseRequestsParameter request)
        {
            var query = _entities.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<PurchaseRequest>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
    }
}
