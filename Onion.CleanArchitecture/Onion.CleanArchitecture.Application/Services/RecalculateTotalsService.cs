using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Services
{
    public class RecalculateTotalsService : IRecalculateTotalsService
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

        public async Task RecalculateFromItemAsync(int itemId)
        {
            var item = await _itemRepo.GetByIdAsync(itemId);
            if (item == null) return; 

            await RecalculateFromCategoryAsync(item.PurchaseRequestCategoryId);
        }

        public async Task RecalculateFromCategoryAsync(int categoryId)
        {
            var category = await _categoryRepo.GetByIdAsync(categoryId);
            if (category == null) return;

            // 1. Cập nhật số tiền ĐỀ XUẤT và độ lệch
            category.TotalProposedAmount = await _itemRepo.GetTotalProposedAmountByCategoryIdAsync(category.Id);
            category.Difference = category.AllowedQuota - category.TotalProposedAmount;

            // 2. Cập nhật số tiền THỰC TẾ và độ lệch
            category.ActualTotalAmount = await _itemRepo.GetActualTotalAmountByCategoryIdAsync(category.Id);
            category.ActualDifference = category.AllowedQuota - category.ActualTotalAmount;
            
            await _categoryRepo.UpdateAsync(category);

            // 3. Đẩy lên tính cho phiếu tổng
            await RecalculateFromRequestAsync(category.PurchaseRequestId);
        }

        public async Task RecalculateFromRequestAsync(int purchaseRequestId)
        {
            var request = await _requestRepo.GetByIdAsync(purchaseRequestId);
            if (request == null) return;

            // Cập nhật Tổng tiền đề xuất và Tổng tiền thực tế cho toàn phiếu
            request.TotalProposedAmount = await _categoryRepo.GetTotalProposedAmountByRequestIdAsync(request.Id);
            request.TotalActualAmount = await _categoryRepo.GetTotalActualAmountByRequestIdAsync(request.Id);
            
            await _requestRepo.UpdateAsync(request);
        }
    }
}