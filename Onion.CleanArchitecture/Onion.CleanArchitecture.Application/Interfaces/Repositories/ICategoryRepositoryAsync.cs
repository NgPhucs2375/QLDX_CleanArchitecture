using Onion.CleanArchitecture.Application.Features.Categories.Queries.GetAllCategories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface ICategoryRepositoryAsync : IGenericRepositoryAsync<Category>
    {
        Task<bool> IsUniqueCodeAsync(string code);
        Task<PagedList<Category>> GetPagedCategoriesAsync(GetAllCategoriesParameter parameter);
    }
}
