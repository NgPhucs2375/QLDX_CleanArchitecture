using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers;
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
    public class ConfigApproverRepositoryAsync : GenericRepositoryAsync<ConfigApprover>, IConfigApproverRepositoryAsync
    {
        private readonly DbSet<ConfigApprover> _configApprovers;

        public ConfigApproverRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _configApprovers = dbContext.Set<ConfigApprover>();
        }

        public async Task<PagedList<ConfigApprover>> GetPagedConfigApproversAsync(GetAllConfigApproversParameter request)
        {
            var query = _configApprovers.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<ConfigApprover>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }

        public async Task<List<ConfigApprover>> GetByConfigAndDepartmentAsync(int proposalConfigId, int departmentId)
        {
            return await _configApprovers
                .Where(ca => ca.ProposalConfigId == proposalConfigId
                          && ca.DepartmentId == departmentId)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
