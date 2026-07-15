using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories;
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

        // method get List danh mục cấu hình dựa trên proposalConfig.Id and department.Id
        public async Task<List<ConfigCategory>> GetByConfigAndDepartmentAsync(int proposalConfigId, int departmentId)
        {
            // trả vể promise tập hợp của danh mục cấu hình 
            // bao gom ca thong tin of Category 
            // voi dieu kien la Id.ProposalConfig phai khop voi field proposalId
            // Id.Department phai khop voi field departmentId
            // AsNoTracking() để không theo dõi các thay đổi của các thực thể được truy vấn, giúp cải thiện hiệu suất khi chỉ cần đọc dữ liệu mà không cần cập nhật.
            // ToListAsync() để thực hiện truy vấn và trả về kết quả dưới dạng danh sách bất đồng bộ.
            return await _configCategories
                .Include(cc => cc.Category)
                .Where(cc => cc.ProposalConfigId == proposalConfigId
                          && cc.DepartmentId == departmentId)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
