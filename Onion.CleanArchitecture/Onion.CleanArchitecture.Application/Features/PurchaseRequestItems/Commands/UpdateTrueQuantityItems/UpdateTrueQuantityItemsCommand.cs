using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.UpdateTrueQuantityItems
{
    public class ActualQuantityItemDTo
    {
        public int Id { get; set; }
        public int ActualQuantity { get; set; }
    }

    public class UpdateTrueQuantityItemsCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestId { get; set; }
        public List<ActualQuantityItemDTo> ActualQuantityItems { get; set; }
    }

    public class UpdateTrueQuantityItemsCommandHandler : IRequestHandler<UpdateTrueQuantityItemsCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _phieudexuatRepo;
        private readonly IPurchaseRequestItemRepositoryAsync _itemRepo;
        private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;

        public UpdateTrueQuantityItemsCommandHandler(
            IPurchaseRequestRepositoryAsync phieudexuatRepo,
            IPurchaseRequestItemRepositoryAsync itemRepo,
            IPurchaseRequestCategoryRepositoryAsync categoryRepo
        )
        {
            _phieudexuatRepo = phieudexuatRepo;
            _itemRepo = itemRepo;
            _categoryRepo = categoryRepo;
        }

        public async Task<Response<int>> Handle(UpdateTrueQuantityItemsCommand request, CancellationToken cancellationToken)
        {
            var status = await _phieudexuatRepo.GetStatusByIdAsync(request.PurchaseRequestId);
            if (status == null)
                throw new ApiException($"Phiếu đề xuất {request.PurchaseRequestId} không tồn tại!");
            if (status != PurchaseRequestStatus.PendingOrderConfirm)
                throw new ApiException($"Phiếu đề xuất {request.PurchaseRequestId} không ở trạng thái chờ xác nhận đặt hàng!");

            var categoryIds = new HashSet<int>();

            foreach (var dto in request.ActualQuantityItems)
            {
                var item = await _itemRepo.GetByIdAsync(dto.Id);
                if (item == null)
                    throw new ApiException($"Item Id {dto.Id} không tồn tại!");

                item.ActualQuantity = dto.ActualQuantity;
                item.ActualTotalAmount = dto.ActualQuantity * item.UnitPrice;
                await _itemRepo.UpdateAsync(item);

                categoryIds.Add(item.PurchaseRequestCategoryId);
            }

            foreach (var catId in categoryIds)
            {
                var catActual = await _itemRepo.GetActualTotalAmountByCategoryIdAsync(catId);
                var catProposed = await _itemRepo.GetTotalProposedAmountByCategoryIdAsync(catId);

                var category = await _categoryRepo.GetByIdAsync(catId);
                if (category == null) continue;

                category.ActualTotalAmount = catActual;
                category.ActualDifference = category.AllowedQuota - catActual;
                category.TotalProposedAmount = catProposed;
                category.Difference = category.AllowedQuota - catProposed;

                await _categoryRepo.UpdateAsync(category);
            }

            var totalActual = await _categoryRepo.GetTotalActualAmountByRequestIdAsync(request.PurchaseRequestId);
            var totalProposed = await _categoryRepo.GetTotalProposedAmountByRequestIdAsync(request.PurchaseRequestId);

            var pr = await _phieudexuatRepo.GetByIdAsync(request.PurchaseRequestId);
            if (pr != null)
            {
                pr.TotalActualAmount = totalActual;
                pr.TotalProposedAmount = totalProposed;
                await _phieudexuatRepo.UpdateAsync(pr);
            }

            return new Response<int>(request.PurchaseRequestId);
        }
    }
}