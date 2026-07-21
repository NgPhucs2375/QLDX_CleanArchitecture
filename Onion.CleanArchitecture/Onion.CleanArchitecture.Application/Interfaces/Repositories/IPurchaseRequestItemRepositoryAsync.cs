using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestItemRepositoryAsync : IGenericRepositoryAsync<PurchaseRequestItem>
    {
        // Nhờ Database tính toán và phân trang
        Task<PagedList<PurchaseRequestItem>> GetPagedPurchaseRequestItemsAsync(GetAllPurchaseRequestItemsParameter parameter);
        // Nhờ Database tính tổng tiền đề xuất
        Task<decimal> GetTotalProposedAmountByCategoryIdAsync(int categoryId);
        
        // Nhờ Database tính tổng tiền thực tế
        Task<decimal> GetActualTotalAmountByCategoryIdAsync(int categoryId);
    }
}
