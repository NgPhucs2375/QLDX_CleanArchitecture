using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.ReturnForEditPurchaseRequest
{
    public class ReturnForEditPurchaseRequestCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
    }

    public class ReturnForEditPurchaseRequestCommandHandler : IRequestHandler<ReturnForEditPurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _repository;
        private readonly IApprovalRecordService _approvalRecordService;

        public ReturnForEditPurchaseRequestCommandHandler(IPurchaseRequestRepositoryAsync repository, IApprovalRecordService approvalRecordService)
        {
            _repository = repository;
            _approvalRecordService = approvalRecordService;
        }

        public async Task<Response<int>> Handle(ReturnForEditPurchaseRequestCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null) throw new ApiException("Not Found PurchaseRequest");

            var machine = new PurchaseRequestStateMachine(entity);
            if (!machine.CanFire(PurchaseRequestTrigger.ReturnForEdit))
                throw new ApiException("Cannot return for edit in current status");

            machine.Fire(PurchaseRequestTrigger.ReturnForEdit);
            await _repository.UpdateAsync(entity);
            await _approvalRecordService.RecordAsync(entity, PurchaseRequestTrigger.ReturnForEdit, string.Empty, ct);

            return new Response<int>(entity.Id);
        }
    }
}
