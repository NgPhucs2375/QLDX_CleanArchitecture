using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.UpdateActualQuantity
{
    public class UpdateActualQuantityCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public int ActualQuantity { get; set; }
    }

    public class UpdateActualQuantityCommandHandler : IRequestHandler<UpdateActualQuantityCommand, Response<int>>
    {
        private readonly IPurchaseRequestItemRepositoryAsync _itemRepo;
        private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;
        private readonly IPurchaseRequestRepositoryAsync _requestRepo;
        private readonly IRecalculateTotalsService _recalcService; // Sửa tại đây

        public UpdateActualQuantityCommandHandler(
            IPurchaseRequestItemRepositoryAsync itemRepo,
            IPurchaseRequestCategoryRepositoryAsync categoryRepo,
            IPurchaseRequestRepositoryAsync requestRepo,
            IRecalculateTotalsService recalcService) // Sửa tại đây
        {
            _itemRepo = itemRepo;
            _categoryRepo = categoryRepo;
            _requestRepo = requestRepo;
            _recalcService = recalcService;
        }

        public async Task<Response<int>> Handle(UpdateActualQuantityCommand request, CancellationToken ct)
        {
            var item = await _itemRepo.GetByIdAsync(request.Id);
            if (item == null) throw new ApiException("Not Found PurchaseRequestItem");

            var category = await _categoryRepo.GetByIdAsync(item.PurchaseRequestCategoryId);
            if (category == null) throw new ApiException("Category not found for PurchaseRequestItem");

            var purchaseRequest = await _requestRepo.GetByIdAsync(category.PurchaseRequestId);
            if (purchaseRequest == null) throw new ApiException("PurchaseRequest not found for PurchaseRequestItem");

            if (purchaseRequest.Status != PurchaseRequestStatus.PendingOrderConfirm)
                throw new ApiException("Cannot update Actual Quantity in current status");

            item.ActualQuantity = request.ActualQuantity;
            item.ActualTotalAmount = item.ActualQuantity * item.UnitPrice;
            await _itemRepo.UpdateAsync(item);

            // Đổi tên hàm gọi
            await _recalcService.RecalculateFromItemAsync(item.Id); 

            return new Response<int>(item.Id);
        }
    }
}