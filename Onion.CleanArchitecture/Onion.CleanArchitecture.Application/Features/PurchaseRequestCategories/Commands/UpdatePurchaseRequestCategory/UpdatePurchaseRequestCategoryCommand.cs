using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services; // Thêm namespace
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.UpdatePurchaseRequestCategory
{
    public class UpdatePurchaseRequestCategoryCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public int PurchaseRequestId { get; set; }
        public int CategoryId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal Difference { get; set; }
        public decimal ActualTotalAmount { get; set; }
        public decimal ActualDifference { get; set; }

        public class UpdatePurchaseRequestCategoryCommandHandler : IRequestHandler<UpdatePurchaseRequestCategoryCommand, Response<int>>
        {
            private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
            private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
            private readonly IRecalculateTotalsService _recalculateTotalsService;

            public UpdatePurchaseRequestCategoryCommandHandler(
                IPurchaseRequestCategoryRepositoryAsync repository,
                IPurchaseRequestRepositoryAsync purchaseRequestRepository,
                IRecalculateTotalsService recalculateTotalsService)
            {
                _repository = repository;
                _purchaseRequestRepository = purchaseRequestRepository;
                _recalculateTotalsService = recalculateTotalsService;
            }

            public async Task<Response<int>> Handle(UpdatePurchaseRequestCategoryCommand command, CancellationToken cancellationToken)
            {
                // 1. Load Category cần sửa
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null)
                {
                    throw new ApiException($"Không tìm thấy Category với ID: {command.Id}.");
                }

                // 2. Load và kiểm tra trạng thái phiếu cha
                var parentRequest = await _purchaseRequestRepository.GetByIdAsync(entity.PurchaseRequestId);
                if (parentRequest == null)
                    throw new ApiException($"Không tìm thấy Phiếu đề xuất cha (ID: {entity.PurchaseRequestId}).");

                if (parentRequest.Status != PurchaseRequestStatus.Draft && parentRequest.Status != PurchaseRequestStatus.ReturnedForEdit)
                    throw new ApiException($"Không thể chỉnh sửa danh mục khi phiếu đang ở trạng thái {parentRequest.Status}.");

                // 3. Thực hiện Update
                entity.PurchaseRequestId = command.PurchaseRequestId;
                entity.CategoryId = command.CategoryId;
                entity.AllowedQuota = command.AllowedQuota;
                entity.TotalProposedAmount = command.TotalProposedAmount;
                entity.Difference = command.Difference;
                entity.ActualTotalAmount = command.ActualTotalAmount;
                entity.ActualDifference = command.ActualDifference;
                
                await _repository.UpdateAsync(entity);

                // 4. Tính toán lại tổng tiền
                await _recalculateTotalsService.RecalculateFromCategoryAsync(entity.Id);

                return new Response<int>(entity.Id);
            }
        }
    }
}