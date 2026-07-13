using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.Departments.Queries.GetAllDepartments;
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
    public class DepartmentRepositoryAsync : GenericRepositoryAsync<Department>, IDepartmentRepositoryAsync
    {
        private readonly DbSet<Department> _departments;

        public DepartmentRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _departments = dbContext.Set<Department>();
        }

        public Task<bool> IsUniqueCodeAsync(string code)
        {
            return _departments
                .AllAsync(p => p.Code != code);
        }

        public async Task<PagedList<Department>> GetPagedDepartmentsAsync(GetAllDepartmentsParameter request)
        {
            var departmentQuery = _departments.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                departmentQuery = MethodExtensions.ApplyFilters(departmentQuery, request._filter);
            }

            return await PagedList<Department>.ToPagedList(
                departmentQuery.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }
    }
}
