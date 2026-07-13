using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IConfigCategoryRepositoryAsync : IGenericRepositoryAsync<ConfigCategory>
    {
        Task<PagedList<ConfigCategory>> GetPagedConfigCategoriesAsync(GetAllConfigCategoriesParameter parameter);
    }
}
