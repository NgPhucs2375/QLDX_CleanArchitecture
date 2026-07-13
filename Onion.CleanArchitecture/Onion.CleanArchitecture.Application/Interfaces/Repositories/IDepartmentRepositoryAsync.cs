using Onion.CleanArchitecture.Application.Features.Departments.Queries.GetAllDepartments;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IDepartmentRepositoryAsync : IGenericRepositoryAsync<Department>
    {
        Task<bool> IsUniqueCodeAsync(string code);
        Task<PagedList<Department>> GetPagedDepartmentsAsync(GetAllDepartmentsParameter parameter);
    }
}
