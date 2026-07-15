using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Services
{
    public class RecalculateTotalsService
    {
        private readonly IPurchaseRequestItemRepositoryAsync _itemRepo;
        private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;
        private readonly IPurchaseRequestRepositoryAsync _requestRepo;

        public RecalculateTotalsService(
            IPurchaseRequestItemRepositoryAsync itemRepo,
            IPurchaseRequestCategoryRepositoryAsync categoryRepo,
            IPurchaseRequestRepositoryAsync requestRepo)
        {
            _itemRepo = itemRepo;
            _categoryRepo = categoryRepo;
            _requestRepo = requestRepo;
        }

        public async Task RecalculateForItem(int itemId)
        {
            var item = await _itemRepo.GetByIdAsync(itemId);

            // Lấy category cha (FK = int, GetByIdAsync nhận int)
            var category = await _categoryRepo.GetByIdAsync(item.PurchaseRequestCategoryId);
            if (category == null) return;

            // Lấy tất cả items trong cùng category → tính tổng
            var allItems = await _itemRepo.GetAllAsync();
            var categoryItems = allItems.Where(x => x.PurchaseRequestCategoryId == category.Id);
            category.ActualTotalAmount = categoryItems.Sum(x => x.ActualTotalAmount);
            category.ActualDifference = category.AllowedQuota - category.ActualTotalAmount;
            await _categoryRepo.UpdateAsync(category);

            // Lấy PurchaseRequest cha
            var request = await _requestRepo.GetByIdAsync(category.PurchaseRequestId);
            if (request == null) return;

            // Lấy tất cả categories trong cùng request → tính tổng
            var allCategories = await _categoryRepo.GetAllAsync();
            var requestCategories = allCategories.Where(x => x.PurchaseRequestId == request.Id);
            request.TotalActualAmount = requestCategories.Sum(c => c.ActualTotalAmount);
            await _requestRepo.UpdateAsync(request);
        }
    }
}
