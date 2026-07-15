using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IConfigCategoryRepositoryAsync : IGenericRepositoryAsync<ConfigCategory>
    {
        // Lấy PageList của các danh mục cấu hình dựa trên Lấy all các tham số đã lọc
        Task<PagedList<ConfigCategory>> GetPagedConfigCategoriesAsync(GetAllConfigCategoriesParameter parameter);
        // Lấy danh sách các danh mục cấu hình dựa trên ConfigId và DepartmentId
        Task<List<ConfigCategory>> GetByConfigAndDepartmentAsync(int proposalConfigId, int departmentId);
    }
}
