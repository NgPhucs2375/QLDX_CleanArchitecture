using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CompletePurchaseRequest
{
    public class CompletePurchaseRequestCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
    }

    public class CompletePurchaseRequestCommandHandler : IRequestHandler<CompletePurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _repository;
        private readonly IApprovalRecordService _approvalRecordService;

        public CompletePurchaseRequestCommandHandler(IPurchaseRequestRepositoryAsync repository, IApprovalRecordService approvalRecordService)
        {
            _repository = repository;
            _approvalRecordService = approvalRecordService;
        }

        public async Task<Response<int>> Handle(CompletePurchaseRequestCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null) throw new ApiException("Not Found PurchaseRequest");

            var machine = new PurchaseRequestStateMachine(entity);
            if (!machine.CanFire(PurchaseRequestTrigger.Complete))
                throw new ApiException("Cannot complete in current status");

            machine.Fire(PurchaseRequestTrigger.Complete);
            await _repository.UpdateAsync(entity);
            await _approvalRecordService.RecordAsync(entity, PurchaseRequestTrigger.Complete, string.Empty, ct);

            return new Response<int>(entity.Id);
        }
    }
}
