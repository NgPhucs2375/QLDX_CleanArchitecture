using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.Categories.Queries.GetAllCategories;
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
    public class CategoryRepositoryAsync : GenericRepositoryAsync<Category>, ICategoryRepositoryAsync
    {
        private readonly DbSet<Category> _categories;

        public CategoryRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _categories = dbContext.Set<Category>();
        }

        public Task<bool> IsUniqueCodeAsync(string code)
        {
            return _categories
                .AllAsync(p => p.Code != code);
        }

        public async Task<PagedList<Category>> GetPagedCategoriesAsync(GetAllCategoriesParameter request)
        {
            var categoryQuery = _categories.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                categoryQuery = MethodExtensions.ApplyFilters(categoryQuery, request._filter);
            }

            return await PagedList<Category>.ToPagedList(
                categoryQuery.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
    }
}
