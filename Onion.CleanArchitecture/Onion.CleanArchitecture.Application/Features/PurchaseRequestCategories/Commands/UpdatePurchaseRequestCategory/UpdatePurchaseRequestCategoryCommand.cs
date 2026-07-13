using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.UpdatePurchaseRequestCategory
{
    public class UpdatePurchaseRequestCategoryCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public Guid PurchaseRequestId { get; set; }
        public Guid CategoryId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal Difference { get; set; }
        public decimal ActualTotalAmount { get; set; }
        public decimal ActualDifference { get; set; }

        public class UpdatePurchaseRequestCategoryCommandHandler : IRequestHandler<UpdatePurchaseRequestCategoryCommand, Response<int>>
        {
            private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
            public UpdatePurchaseRequestCategoryCommandHandler(IPurchaseRequestCategoryRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<int>> Handle(UpdatePurchaseRequestCategoryCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null)
                {
                    throw new ApiException($"PurchaseRequestCategory Not Found.");
                }
                else
                {
                    entity.PurchaseRequestId = command.PurchaseRequestId;
                    entity.CategoryId = command.CategoryId;
                    entity.AllowedQuota = command.AllowedQuota;
                    entity.TotalProposedAmount = command.TotalProposedAmount;
                    entity.Difference = command.Difference;
                    entity.ActualTotalAmount = command.ActualTotalAmount;
                    entity.ActualDifference = command.ActualDifference;
                    await _repository.UpdateAsync(entity);
                    return new Response<int>(entity.Id);
                }
            }
        }
    }
}
