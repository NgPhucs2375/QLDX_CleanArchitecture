using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories;
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
    public class ConfigCategoryRepositoryAsync : GenericRepositoryAsync<ConfigCategory>, IConfigCategoryRepositoryAsync
    {
        private readonly DbSet<ConfigCategory> _configCategories;

        public ConfigCategoryRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _configCategories = dbContext.Set<ConfigCategory>();
        }

        public async Task<PagedList<ConfigCategory>> GetPagedConfigCategoriesAsync(GetAllConfigCategoriesParameter request)
        {
            var query = _configCategories.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<ConfigCategory>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
    }
}
