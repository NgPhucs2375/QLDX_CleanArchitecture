using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Application.Features.ApproveRurchaseRequest.Commands.ApprovePurchaseRequestCommand
{
    public class ApprovePurchaseRequestCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestId {get; set;}
        public string Note {get; set;} = string.Empty;
    }

    public class ApprovePurchaseRequestCommandHandler: IRequestHandler<ApprovePurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
        private readonly IPurchaseRequestWorkflowService _workflowService;

        public ApprovePurchaseRequestCommandHandler(IPurchaseRequestRepositoryAsync purchaseRequestRepository,IPurchaseRequestWorkflowService workflowService)
        {
            _purchaseRequestRepository = purchaseRequestRepository;
            _workflowService = workflowService;
        }



    public async Task<Response<int>> Handle(ApprovePurchaseRequestCommandHandler request, CancellationToken ct)
        {
            var entity = await _purchaseRequestRepository.GetByIdWithDetailsAsync(request.PurchaseRequestID);
            if (entity == null)
            {
                throw new ApiException("Not Found.");
            }
            PurchaseRequestTrigger trigger;
            
            switch (entity.Status)
            {
                case PurchaseRequestStatus.PendingDepartment:
                    trigger = PurchaseRequestTrigger.ApproveDepartment;
                    break;
                    
                case PurchaseRequestStatus.PendingControl:
                    trigger = PurchaseRequestTrigger.Approve;
                    break;
                    
                default:
                    throw new ApiException("Cannot approve in current status");
            }

            await _workflowService.ExecuteAsync(entity.Id,trigger,request.Note,ct);
            return new Response<int>(entity.Id);
        }
    };

    
}