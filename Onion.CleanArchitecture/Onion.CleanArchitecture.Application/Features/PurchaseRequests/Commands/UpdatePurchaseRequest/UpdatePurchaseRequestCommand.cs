using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.UpdatePurchaseRequest
{
    public class UpdatePurchaseRequestCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid PurchaseConfigId { get; set; }
        public PurchaseRequestStatus Status { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal TotalActualAmount { get; set; }

        public class UpdatePurchaseRequestCommandHandler : IRequestHandler<UpdatePurchaseRequestCommand, Response<int>>
        {
            private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
            public UpdatePurchaseRequestCommandHandler(IPurchaseRequestRepositoryAsync purchaseRequestRepository)
            {
                _purchaseRequestRepository = purchaseRequestRepository;
            }
            public async Task<Response<int>> Handle(UpdatePurchaseRequestCommand command, CancellationToken cancellationToken)
            {
                var entity = await _purchaseRequestRepository.GetByIdAsync(command.Id);
                if (entity == null)
                {
                    throw new ApiException($"PurchaseRequest Not Found.");
                }
                else
                {
                    entity.Code = command.Code;
                    entity.DepartmentId = command.DepartmentId;
                    entity.PurchaseConfigId = command.PurchaseConfigId;
                    entity.Status = command.Status;
                    entity.TotalProposedAmount = command.TotalProposedAmount;
                    entity.TotalActualAmount = command.TotalActualAmount;
                    await _purchaseRequestRepository.UpdateAsync(entity);
                    return new Response<int>(entity.Id);
                }
            }
        }
    }
}
