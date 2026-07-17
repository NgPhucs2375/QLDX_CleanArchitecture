using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.CreatePurchaseRequestItem
{
    // các field cần thiết
    public class CreatePurchaseRequestItemCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }
        public int ProposedQuantity { get; set; }
    }

    // DI cấp công cụ
    public class CreatePurchaseRequestItemCommandHandler : IRequestHandler<CreatePurchaseRequestItemCommand, Response<int>>
    {
        // Lấy cấu hình của PRItem
        private readonly IPurchaseRequestItemRepositoryAsync _PRItemsRepository;
        // Chỉ đọc cấu hình của products
        private readonly IProductRepositoryAsync _ProductRepository;
        public CreatePurchaseRequestItemCommandHandler(IPurchaseRequestItemRepositoryAsync PRItemsRepository, IProductRepositoryAsync ProductRepository)
        {
            _PRItemsRepository = PRItemsRepository;
            _ProductRepository = ProductRepository;
        }


        // COOK
        public async Task<Response<int>> Handle(CreatePurchaseRequestItemCommand request, CancellationToken cancellationToken)
        {
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

                //  
                ProductCode = product.Code,
                ProductName = product.Name,
                ProductUnit = product.Unit,
                UnitPrice = snapshortPrice,
                ProposedQuantity = proposedQuantity,
                TotalAmount = totalAmount,
                ActualQuantity = 0,
                ActualTotalAmount = 0
            };

            // Save
            await _PRItemsRepository.AddAsync(entity);
            return new Response<int>(entity.Id);
        }
    }
}
