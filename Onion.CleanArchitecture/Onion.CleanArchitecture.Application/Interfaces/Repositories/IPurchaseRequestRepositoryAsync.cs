using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestRepositoryAsync : IGenericRepositoryAsync<PurchaseRequest>
    {
        Task<bool> IsUniqueCodeAsync(string code);
        Task<PagedList<PurchaseRequest>> GetPagedPurchaseRequestsAsync(GetAllPurchaseRequestsParameter parameter);
    }
}
