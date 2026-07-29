using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestRepositoryAsync : IGenericRepositoryAsync<PurchaseRequest>
    {
        // Mooi PDX chi duoc phep co 1 Code duy nhat
        Task<bool> IsUniqueCodeAsync(string code);
        // Moi PDX co PagedList de phan trang 
        Task<PagedList<PurchaseRequest>> GetPagedPurchaseRequestsAsync(GetAllPurchaseRequestsParameter parameter);
        // Moi PDX co GetByIdWithDetailsAsync de lay thong tin chi tiet cua PDX, bao gom cac RequestCategory va RequestItem
        Task<PurchaseRequest> GetByIdWithDetailsAsync(int id);
        Task<decimal> GetUsedAmountByCategoryAsync(int proposalConfigId ,int departmentId, int categoryId,int? excludePurchaseRequestId = null);
        Task<PurchaseRequestStatus?> GetStatusByIdAsync(int id);
        Task<PurchaseRequest?> GetByIdAsync(int id);


    }
}
