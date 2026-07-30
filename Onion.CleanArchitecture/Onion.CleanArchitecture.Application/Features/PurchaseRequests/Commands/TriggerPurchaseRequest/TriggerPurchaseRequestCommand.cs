using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Linq;
using Onion.CleanArchitecture.Application.Contracts;
using System;

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
        private readonly IEventBusService _bus;


        public TriggerPurchaseRequestCommandHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepositoryAsync,
            IPurchaseRequestWorkflowService workflowService,
            IApprovalRecordService approvalRecordService,
            IAuthenticatedUserService authenticatedUser,
            IEventBusService bus
        )
        {
            _purchaseRequestRepository = purchaseRequestRepositoryAsync;
            _workflowService = workflowService;
            _approvalRecordService = approvalRecordService;
            _authenticatedUser = authenticatedUser;
            _bus = bus;
        }

        public async Task<Response<int>> Handle(TriggerPurchaseRequestCommand request, CancellationToken ct)
        {
            // 1. Get du lieu tu database
            var entity = await _purchaseRequestRepository.GetByIdWithDetailsAsync(request.Id);
            if (entity == null) // $ để nội suy
               throw new ApiException($"Không tìm thấy phiếu đề xuất với ID: {request.Id}");

            var correlationId = MassTransit.NewId.NextGuid();
            var currenUserId = _authenticatedUser.UserId ?? string.Empty;
            var currentTime = DateTime.UtcNow;
            var note = request.Note ?? string.Empty;
            var action = request.Action.Trim().ToLower() ?? "";
            // request.Actio : là hành động mà người dùng muốn thực hiện trên phiếu đề xuất, ví dụ: "submit", "approve", "reject", "return", "confirm"
            // .Trim() : loại bỏ khoảng trắng ở đầu và cuối chuỗi
            // .ToLower() : chuyển chuỗi thành chữ thường để so sánh không phân
            // Phaan luoong logic Saga 
            switch(action)
            {
                case "submit":
                    var submitCmd = new SubmitPurchaseRequestCommand(
                        correlationId,
                        entity.Id,
                        entity.TotalProposedAmount,
                        currenUserId,
                        currentTime
                    );
                    await _bus.PublishAsync(submitCmd,ct);
                break;
                case "approve":
                    if(entity.Status == PurchaseRequestStatus.PendingDepartment)
                    {
                        var cmd = new ApproveDepartmentCommand(
                            correlationId,
                            entity.Id,
                            currenUserId,
                            currentTime,
                            note
                        );
                        await _bus.PublishAsync(cmd,ct);
                    }
                    else if (entity.Status == PurchaseRequestStatus.PendingControl)
                    {
                        var cmd = new ApproveControlCommand(
                            correlationId,
                            entity.Id,
                            currenUserId,
                            currentTime,
                            note
                        );
                        await _bus.PublishAsync(cmd,ct);
                    }
                    else
                    {
                        throw new ApiException($"Không thể 'approve' khi trạng thái hiện tại là '{entity.Status}'");
                    }
                break;

                case "reject":
                    if (entity.Status == PurchaseRequestStatus.PendingDepartment)
                    {
                        var cmd = new RejectDepartmentCommand(
                            correlationId,
                            entity.Id,
                            currenUserId,
                            note,
                            currentTime
                        );
                        await _bus.PublishAsync(cmd,ct);
                    }else if (entity.Status == PurchaseRequestStatus.PendingControl)
                    {
                        var cmd = new RejectControlCommand(
                            correlationId,
                            entity.Id,
                            currenUserId,
                            note,
                            currentTime
                        );
                        await _bus.PublishAsync(cmd,ct);
                    }else
                    {
                        throw new ApiException($"Không thể 'reject' khi trạng thái hiện tại là '{entity.Status}'");
                    }
                break;
                case "return":
                    var returnCmd = new ReturnForEditCommand(
                        correlationId,
                        entity.Id,
                        currenUserId,
                        currentTime,
                        entity.TotalProposedAmount,

                        note

                        
                    );
                    await _bus.PublishAsync(returnCmd,ct);
                break;
                case "confirm":
                    var confirmCmd = new ConfirmOrderCommand(
                        correlationId,
                        entity.Id,
                        currenUserId,
                        currentTime
                    );
                    await _bus.PublishAsync(confirmCmd,ct);
                break;

                default:
                    throw new ApiException($"Hành động '{action}' không được hệ thống hỗ trợ.");
            }

            //  Return response
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