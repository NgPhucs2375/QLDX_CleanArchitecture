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
        public int DepartmentId { get; set; }
        public int ProposalConfigId { get; set; }
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
                if (entity.Status != PurchaseRequestStatus.Draft && entity.Status != PurchaseRequestStatus.ReturnedForEdit)
                {
                    throw new ApiException($"Không thể chỉnh phiếu ở trạng thái {entity.Status}.");
                }
                else
                {
                    entity.Code = command.Code;
                    entity.DepartmentId = command.DepartmentId;
                    entity.ProposalConfigId = command.ProposalConfigId;
                    entity.TotalProposedAmount = command.TotalProposedAmount;
                    entity.TotalActualAmount = command.TotalActualAmount;
                    // save
                    await _purchaseRequestRepository.UpdateAsync(entity);
                    return new Response<int>(entity.Id);
                }
            }
        }
    }
}
