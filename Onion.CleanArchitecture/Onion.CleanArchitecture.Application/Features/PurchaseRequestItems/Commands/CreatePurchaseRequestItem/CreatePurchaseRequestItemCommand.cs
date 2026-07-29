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

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.CreatePurchaseRequestItem
{
    public class CreatePurchaseRequestItemCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }
        public int ProposedQuantity { get; set; }
    }

    public class CreatePurchaseRequestItemCommandHandler : IRequestHandler<CreatePurchaseRequestItemCommand, Response<int>>
    {
        private readonly IPurchaseRequestItemRepositoryAsync _PRItemsRepository;
        private readonly IProductRepositoryAsync _ProductRepository;
        private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;
        private readonly IPurchaseRequestRepositoryAsync _requestRepo;
        private readonly IRecalculateTotalsService _recalculateService;
        private readonly ISagaInstanceRepository _sagaRepository;

        public CreatePurchaseRequestItemCommandHandler(
            IPurchaseRequestItemRepositoryAsync PRItemsRepository, 
            IProductRepositoryAsync ProductRepository,
            IPurchaseRequestCategoryRepositoryAsync categoryRepo,
            IPurchaseRequestRepositoryAsync requestRepo,
            IRecalculateTotalsService recalculateService,
            ISagaInstanceRepository sagaRepository)
        {
            _PRItemsRepository = PRItemsRepository;
            _ProductRepository = ProductRepository;
            _categoryRepo = categoryRepo;
            _requestRepo = requestRepo;
            _recalculateService = recalculateService;
            _sagaRepository = sagaRepository;
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestItemCommand request, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra trạng thái phiếu cha
            var category = await _categoryRepo.GetByIdAsync(request.PurchaseRequestCategoryId);
            if (category == null) throw new ApiException("Không tìm thấy Category cha.");

            var parentRequest = await _requestRepo.GetByIdAsync(category.PurchaseRequestId);
            if (parentRequest == null) throw new ApiException("Không tìm thấy Phiếu đề xuất cha.");

            var sagaState = await _sagaRepository.GetCurrentStateByRequestIdAsync(parentRequest.Id);
            if (sagaState != null && sagaState != "ReturnedForEdit")
                throw new ApiException("Không thể thêm Item khi phiếu đã được submit.");

            // 2. Validate Product
            var product = await _ProductRepository.GetByIdAsync(request.ProductId);
            if (product == null)
               throw new ApiException($"Sản phẩm với ID {request.ProductId} không tồn tại!");

            var snapshortPrice = product.UnitPrice;
            var proposedQuantity = request.ProposedQuantity > 0 ? request.ProposedQuantity : 1;
            var totalAmount = snapshortPrice * proposedQuantity;

            var entity = new PurchaseRequestItem
            {
                PurchaseRequestCategoryId = request.PurchaseRequestCategoryId,
                ProductId = request.ProductId,
                ProductCode = product.Code,
                ProductName = product.Name,
                ProductUnit = product.Unit,
                UnitPrice = snapshortPrice,
                ProposedQuantity = proposedQuantity,
                TotalAmount = totalAmount,
                ActualQuantity = 0,
                ActualTotalAmount = 0
            };

            // 3. Save & Recalculate
            await _PRItemsRepository.AddAsync(entity);
            await _recalculateService.RecalculateFromItemAsync(entity.Id);

            return new Response<int>(entity.Id);
        }
    }
}