using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IRecalculateTotalsService
    {
        // Dùng khi Thêm/Sửa Item (Vì item vẫn còn trong DB)
        Task RecalculateFromItemAsync(int itemId);
        
        // Dùng khi Xóa Item hoặc Thêm/Sửa/Xóa Category
        Task RecalculateFromCategoryAsync(int categoryId);
        
        // Dùng tính trực tiếp cho phiếu tổng
        Task RecalculateFromRequestAsync(int purchaseRequestId);
    }
}