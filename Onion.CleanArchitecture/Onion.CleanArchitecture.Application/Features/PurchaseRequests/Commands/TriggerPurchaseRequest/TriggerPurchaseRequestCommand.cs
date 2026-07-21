using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Application.Features.TriggerPurchaseRequest.Commands.TriggerPurchaseRequestCommand
{
    public class TriggerPurchaseRequestCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
    }

    public class TriggerPurchaseRequestCommandHandler: IRequestHandler<TriggerPurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IApprovalRecordService _approvalRecordService;
        private readonly IAuthenticatedUserService _authenticatedUser;


        public TriggerPurchaseRequestCommandHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepositoryAsync,
            IPurchaseRequestWorkflowService workflowService,
            IApprovalRecordService approvalRecordService,
            IAuthenticatedUserService authenticatedUser
        )
        {
            _purchaseRequestRepository = purchaseRequestRepositoryAsync;
            _workflowService = workflowService;
            _approvalRecordService = approvalRecordService;
            _authenticatedUser = authenticatedUser;
        }

        public async Task<Response<int>> Handle(TriggerPurchaseRequestCommand request, CancellationToken ct)
        {
            // 1. Get du lieu tu database
            var entity = await _purchaseRequestRepository.GetByIdWithDetailsAsync(request.Id);
            if (entity == null) // $ để nội suy
               throw new ApiException($"Không tìm thấy phiếu đề xuất với ID: {request.Id}");

            // 2. Map action to trigger        
            PurchaseRequestTrigger trigger = MapActionToTrigger(request.Action, entity.Status);

            // 3. Fire event
            var machine = new PurchaseRequestStateMachine(_workflowService, _approvalRecordService, entity, _authenticatedUser.UserId);
            await machine.FireAsync(trigger, request.Note, ct);
                
            // 4. Update entity in database 
            await _purchaseRequestRepository.UpdateAsync(entity);

            // 5. Return response
            return new Response<int>(entity.Id);

        }
        private PurchaseRequestTrigger MapActionToTrigger(string action, PurchaseRequestStatus currentStatus)
        {
            string ChuanHoaAction = action?.Trim().ToLower() ?? "";

            return ChuanHoaAction switch
            {
                "submit" => PurchaseRequestTrigger.Submit,
                "approve" => currentStatus switch
                {
                    PurchaseRequestStatus.PendingDepartment => PurchaseRequestTrigger.ApproveDepartment,
                    PurchaseRequestStatus.PendingControl => PurchaseRequestTrigger.Approve,
                    _ => throw new ApiException($"Không thể thực hiện hành động '{action}' khi trạng thái hiện tại là '{currentStatus}'")
                },
                "reject" => PurchaseRequestTrigger.Reject,
                "return" => PurchaseRequestTrigger.ReturnForEdit,
                "confirm" => PurchaseRequestTrigger.ConfirmOrder,
                _ => throw new ApiException($"Hành động '{action}' không được hệ thống hỗ trợ."),
            };
        }
    }
}