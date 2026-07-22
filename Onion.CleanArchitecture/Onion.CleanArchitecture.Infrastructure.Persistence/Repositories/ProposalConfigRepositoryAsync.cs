using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetAllProposalConfigs;
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
    public class ProposalConfigRepositoryAsync : GenericRepositoryAsync<ProposalConfig>, IProposalConfigRepositoryAsync
    {
        private readonly DbSet<ProposalConfig> _proposalConfigs;

        public ProposalConfigRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _proposalConfigs = dbContext.Set<ProposalConfig>();
        }

        public Task<bool> IsUniqueCodeAsync(string code)
        {
            return _proposalConfigs
                .AllAsync(p => p.Code != code);
        }

        public async Task<PagedList<ProposalConfig>> GetPagedProposalConfigsAsync(GetAllProposalConfigsParameter request)
        {
            var query = _proposalConfigs.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<ProposalConfig>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }

        public async Task<ProposalConfig> GetByIdWithDetailsAsync(int id)
        {
            return await _proposalConfigs
                .Include(p => p.ConfigCategories)
                    .ThenInclude(cc => cc.Category)
                .Include(p => p.ConfigCategories)
                    .ThenInclude(cc => cc.Department)
                .Include(p => p.ConfigApprovers)
                    .ThenInclude(ca => ca.Department)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
