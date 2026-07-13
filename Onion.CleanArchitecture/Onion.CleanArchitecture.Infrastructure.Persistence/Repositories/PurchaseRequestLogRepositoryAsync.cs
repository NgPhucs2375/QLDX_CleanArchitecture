using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs;
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
    public class PurchaseRequestLogRepositoryAsync : GenericRepositoryAsync<PurchaseRequestLog>, IPurchaseRequestLogRepositoryAsync
    {
        private readonly DbSet<PurchaseRequestLog> _entities;

        public PurchaseRequestLogRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _entities = dbContext.Set<PurchaseRequestLog>();
        }

        public async Task<PagedList<PurchaseRequestLog>> GetPagedPurchaseRequestLogsAsync(GetAllPurchaseRequestLogsParameter request)
        {
            var query = _entities.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<PurchaseRequestLog>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
    }
}
