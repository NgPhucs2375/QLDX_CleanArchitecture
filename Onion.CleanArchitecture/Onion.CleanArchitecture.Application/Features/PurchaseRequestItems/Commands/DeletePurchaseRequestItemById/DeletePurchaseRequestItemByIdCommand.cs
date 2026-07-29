using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.DeletePurchaseRequestItemById
{
    public class DeletePurchaseRequestItemByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeletePurchaseRequestItemByIdCommandHandler : IRequestHandler<DeletePurchaseRequestItemByIdCommand, Response<int>>
        {
            private readonly IPurchaseRequestItemRepositoryAsync _repository;
            private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;
            private readonly IPurchaseRequestRepositoryAsync _requestRepo;
            private readonly IRecalculateTotalsService _recalculateService;
            private readonly ISagaInstanceRepository _sagaRepository;

            public DeletePurchaseRequestItemByIdCommandHandler(
                IPurchaseRequestItemRepositoryAsync repository,
                IPurchaseRequestCategoryRepositoryAsync categoryRepo,
                IPurchaseRequestRepositoryAsync requestRepo,
                IRecalculateTotalsService recalculateService,
                ISagaInstanceRepository sagaRepository)
            {
                _repository = repository;
                _categoryRepo = categoryRepo;
                _requestRepo = requestRepo;
                _recalculateService = recalculateService;
                _sagaRepository = sagaRepository;
            }

            public async Task<Response<int>> Handle(DeletePurchaseRequestItemByIdCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestItem Not Found.");

                // 1. Kiểm tra trạng thái phiếu cha
                var category = await _categoryRepo.GetByIdAsync(entity.PurchaseRequestCategoryId);
                if (category == null) throw new ApiException("Không tìm thấy Category cha.");

                var parentRequest = await _requestRepo.GetByIdAsync(category.PurchaseRequestId);
                if (parentRequest == null) throw new ApiException("Không tìm thấy Phiếu đề xuất cha.");

                var sagaState = await _sagaRepository.GetCurrentStateByRequestIdAsync(parentRequest.Id);
                if (sagaState != null && sagaState != "ReturnedForEdit")
                    throw new ApiException("Không thể xóa Item khi phiếu đã được submit.");

                var categoryId = entity.PurchaseRequestCategoryId;

                // 2. Delete & Recalculate
                await _repository.DeleteAsync(entity);
                await _recalculateService.RecalculateFromCategoryAsync(categoryId);

                return new Response<int>(entity.Id);
            }
        }
    }
}