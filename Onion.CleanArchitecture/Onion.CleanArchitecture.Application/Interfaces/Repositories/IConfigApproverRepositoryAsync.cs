using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IConfigApproverRepositoryAsync : IGenericRepositoryAsync<ConfigApprover>
    {
        Task<PagedList<ConfigApprover>> GetPagedConfigApproversAsync(GetAllConfigApproversParameter parameter);
    }
}
