using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.UpdatePurchaseRequestItem
{
    public class UpdatePurchaseRequestItemCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }

        public class UpdatePurchaseRequestItemCommandHandler : IRequestHandler<UpdatePurchaseRequestItemCommand, Response<int>>
        {
            private readonly IPurchaseRequestItemRepositoryAsync _repository;
            private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;
            private readonly IPurchaseRequestRepositoryAsync _requestRepo;
            private readonly IRecalculateTotalsService _recalculateService;

            public UpdatePurchaseRequestItemCommandHandler(
                IPurchaseRequestItemRepositoryAsync repository,
                IPurchaseRequestCategoryRepositoryAsync categoryRepo,
                IPurchaseRequestRepositoryAsync requestRepo,
                IRecalculateTotalsService recalculateService)
            {
                _repository = repository;
                _categoryRepo = categoryRepo;
                _requestRepo = requestRepo;
                _recalculateService = recalculateService;
            }

            public async Task<Response<int>> Handle(UpdatePurchaseRequestItemCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null)
                    throw new ApiException($"PurchaseRequestItem Not Found.");

                // 1. Kiểm tra trạng thái phiếu cha
                var category = await _categoryRepo.GetByIdAsync(entity.PurchaseRequestCategoryId);
                if (category == null) throw new ApiException("Không tìm thấy Category cha.");

                var parentRequest = await _requestRepo.GetByIdAsync(category.PurchaseRequestId);
                if (parentRequest == null) throw new ApiException("Không tìm thấy Phiếu đề xuất cha.");

                if (parentRequest.Status != PurchaseRequestStatus.Draft && parentRequest.Status != PurchaseRequestStatus.ReturnedForEdit)
                    throw new ApiException($"Không thể chỉnh sửa Item khi phiếu đang ở trạng thái {parentRequest.Status}.");

                // 2. Map & Update
                entity.PurchaseRequestCategoryId = command.PurchaseRequestCategoryId;
                entity.ProductId = command.ProductId;
                entity.UnitPrice = command.UnitPrice;
                entity.ProposedQuantity = command.ProposedQuantity;
                entity.TotalAmount = command.TotalAmount;
                entity.ActualQuantity = command.ActualQuantity;
                entity.ActualTotalAmount = command.ActualTotalAmount;
                
                await _repository.UpdateAsync(entity);

                // 3. Recalculate
                await _recalculateService.RecalculateFromItemAsync(entity.Id);

                return new Response<int>(entity.Id);
            }
        }
    }
}