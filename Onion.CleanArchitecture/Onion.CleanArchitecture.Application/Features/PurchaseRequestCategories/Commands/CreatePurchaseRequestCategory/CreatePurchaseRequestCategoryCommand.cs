using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.CreatePurchaseRequestCategory
{
    public class CreatePurchaseRequestCategoryCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestId { get; set; }
        public int CategoryId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal Difference { get; set; }
        public decimal ActualTotalAmount { get; set; }
        public decimal ActualDifference { get; set; }
    }
    public class CreatePurchaseRequestCategoryCommandHandler : IRequestHandler<CreatePurchaseRequestCategoryCommand, Response<int>>
    {
        private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
        private readonly IMapper _mapper;
        private readonly IRecalculateTotalsService _recalculateTotalsService;
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
        private readonly ISagaInstanceRepository _sagaRepository;

        public CreatePurchaseRequestCategoryCommandHandler(
            IPurchaseRequestCategoryRepositoryAsync repository,
            IMapper mapper,
            IRecalculateTotalsService recalculateTotalsService,
            IPurchaseRequestRepositoryAsync purchaseRequestRepository,
            ISagaInstanceRepository sagaRepository)
        {
            _repository = repository;
            _mapper = mapper;
            _recalculateTotalsService = recalculateTotalsService;
            _purchaseRequestRepository = purchaseRequestRepository;
            _sagaRepository = sagaRepository;
        }

    

        public async Task<Response<int>> Handle(CreatePurchaseRequestCategoryCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra trạng thái phiếu cha
            var parentRequest = await _purchaseRequestRepository.GetByIdAsync(request.PurchaseRequestId);
            if (parentRequest == null)
                throw new ApiException($"Không tìm thấy Phiếu đề xuất với ID: {request.PurchaseRequestId}");

            var sagaState = await _sagaRepository.GetCurrentStateByRequestIdAsync(parentRequest.Id);
            if (sagaState != null && sagaState != "ReturnedForEdit")
                throw new ApiException("Không thể thêm danh mục khi phiếu đã được submit.");

            // 2. Thực hiện thêm mới
            var entity = _mapper.Map<PurchaseRequestCategory>(request);
            await _repository.AddAsync(entity);

            // 3. Tính toán lại tổng tiền phiếu cha
            await _recalculateTotalsService.RecalculateFromCategoryAsync(entity.Id);

            return new Response<int>(entity.Id);
        }
    }
}
