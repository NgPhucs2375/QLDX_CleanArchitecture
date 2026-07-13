using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestItemRepositoryAsync : IGenericRepositoryAsync<PurchaseRequestItem>
    {
        Task<PagedList<PurchaseRequestItem>> GetPagedPurchaseRequestItemsAsync(GetAllPurchaseRequestItemsParameter parameter);
    }
}
