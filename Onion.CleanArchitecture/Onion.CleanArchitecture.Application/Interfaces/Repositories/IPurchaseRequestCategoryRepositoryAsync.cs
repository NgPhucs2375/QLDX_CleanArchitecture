using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetAllPurchaseRequestCategories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestCategoryRepositoryAsync : IGenericRepositoryAsync<PurchaseRequestCategory>
    {
        Task<PagedList<PurchaseRequestCategory>> GetPagedPurchaseRequestCategoriesAsync(GetAllPurchaseRequestCategoriesParameter parameter);
        Task<decimal> GetTotalProposedAmountByRequestIdAsync(int purchaseRequestId);
        Task<decimal> GetTotalActualAmountByRequestIdAsync(int purchaseRequestId);    }
}
