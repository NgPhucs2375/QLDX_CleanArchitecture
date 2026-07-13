using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.UpdatePurchaseRequestItem
{
    public class UpdatePurchaseRequestItemCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public Guid PurchaseRequestCategoryId { get; set; }
        public Guid ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }

        public class UpdatePurchaseRequestItemCommandHandler : IRequestHandler<UpdatePurchaseRequestItemCommand, Response<int>>
        {
            private readonly IPurchaseRequestItemRepositoryAsync _repository;
            public UpdatePurchaseRequestItemCommandHandler(IPurchaseRequestItemRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<int>> Handle(UpdatePurchaseRequestItemCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null)
                {
                    throw new ApiException($"PurchaseRequestItem Not Found.");
                }
                else
                {
                    entity.PurchaseRequestCategoryId = command.PurchaseRequestCategoryId;
                    entity.ProductId = command.ProductId;
                    entity.UnitPrice = command.UnitPrice;
                    entity.ProposedQuantity = command.ProposedQuantity;
                    entity.TotalAmount = command.TotalAmount;
                    entity.ActualQuantity = command.ActualQuantity;
                    entity.ActualTotalAmount = command.ActualTotalAmount;
                    await _repository.UpdateAsync(entity);
                    return new Response<int>(entity.Id);
                }
            }
        }
    }
}
