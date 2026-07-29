using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using MediatR;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Domain.Enums;
using Wrappers = Onion.CleanArchitecture.Application.Wrappers;


namespace Onion.CleanArchitecture.Application.Features.TriggerPurchaseRequest.Commands.TriggerPurchaseRequestCommand
{
    public class TriggerPurchaseRequestCommand : IRequest<Wrappers.Response<int>>
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
    }

    public class TriggerPurchaseRequestCommandHandler: IRequestHandler<TriggerPurchaseRequestCommand, Wrappers.Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IEventBusService _bus;
        private readonly ISagaInstanceRepository _sagaRepository; 

        public TriggerPurchaseRequestCommandHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepositoryAsync,
            IAuthenticatedUserService authenticatedUser,
            IEventBusService bus,
            ISagaInstanceRepository sagaRepository
        )
        {
            _purchaseRequestRepository = purchaseRequestRepositoryAsync;
            _authenticatedUser = authenticatedUser;
            _bus = bus;
            _sagaRepository = sagaRepository;
        }

        public async Task<Wrappers.Response<int>> Handle(TriggerPurchaseRequestCommand request, CancellationToken ct)
        {
            var entity = await _purchaseRequestRepository.GetByIdWithDetailsAsync(request.Id);
            if (entity == null)
               throw new ApiException($"Không tìm thấy phiếu đề xuất với ID: {request.Id}");

            var sagaState = await _sagaRepository.GetCurrentStateByRequestIdAsync(request.Id);
            PurchaseRequestTrigger trigger = MapActionToTrigger(request.Action, sagaState);
            var userId = _authenticatedUser.UserId;

            // Publish event tương ứng — Saga sẽ validate + update state
            await PublishEventAsync(trigger, entity, userId, request.Note, sagaState, ct);

            // ConfirmOrder cần tính TotalActualAmount từ items do user nhập trên Modal
            if (trigger == PurchaseRequestTrigger.ConfirmOrder)
            {
                entity.TotalActualAmount = entity.RequestCategories
                    ?.Where(c => c.RequestItems != null)
                    .SelectMany(c => c.RequestItems)
                    .Sum(i => i.ActualTotalAmount) ?? 0;
            }

            await _purchaseRequestRepository.UpdateAsync(entity);
            return new Wrappers.Response<int>(entity.Id);
        }

        private async Task PublishEventAsync(PurchaseRequestTrigger trigger, Domain.Entities.PurchaseRequest entity,
            string userId, string note, string? sagaState,CancellationToken ct)
        {
            switch (trigger)
            {
                case PurchaseRequestTrigger.Submit:
                    await _bus.PublishAsync(new PurchaseRequestSubmittedEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        TotalAmount: entity.TotalProposedAmount,
                        SubmittedBy: userId,
                        OccurredAt: DateTime.UtcNow
                    ), ct);
                    break;

                case PurchaseRequestTrigger.ApproveDepartment:
                    await _bus.PublishAsync(new PurchaseRequestDepartmentApprovedEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        ApprovedBy: userId,
                        ApprovedAt: DateTime.UtcNow,
                        Note: note
                    ), ct);
                    break;

                case PurchaseRequestTrigger.Reject when sagaState == "PendingDepartment":
                    await _bus.PublishAsync(new PurchaseRequestDepartmentRejectedEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        RejectedBy: userId,
                        Note: note,
                        OccurredAt: DateTime.UtcNow
                    ), ct);
                    break;

                case PurchaseRequestTrigger.Reject:
                    await _bus.PublishAsync(new PurchaseRequestControlRejectedEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        RejectedBy: userId,
                        Note: note,
                        OccurredAt: DateTime.UtcNow
                    ), ct);
                    break;

                case PurchaseRequestTrigger.Approve:
                    await _bus.PublishAsync(new PurchaseRequestControlApprovedEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        ApprovedBy: userId,
                        Note: note,
                        OccurredAt: DateTime.UtcNow
                    ), ct);
                    break;

                case PurchaseRequestTrigger.ReturnForEdit:
                    await _bus.PublishAsync(new PurchaseRequestReturnedForEditEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        ReturnedBy: userId,
                        ReturnAt: DateTime.UtcNow,
                        TotalAmount: entity.TotalProposedAmount,
                        SubmittedBy: entity.CreatedBy,
                        Note: note
                    ), ct);
                    break;

                case PurchaseRequestTrigger.ConfirmOrder:
                    await _bus.PublishAsync(new PurchaseRequestOrderConfirmedEvent(
                        CorrelationId: NewId.NextGuid(),
                        RequestId: entity.Id,
                        ConfirmedBy: userId,
                        ConfirmedAt: DateTime.UtcNow,
                        TotalAmount: entity.TotalProposedAmount,
                        SubmittedBy: entity.CreatedBy
                    ), ct);
                    break;

                default:
                    throw new ApiException($"Không hỗ trợ trigger '{trigger}'");
            }
        }
private PurchaseRequestTrigger MapActionToTrigger(string action, string? sagaState)
{
    string ChuanHoaAction = action?.Trim().ToLower() ?? "";

    return ChuanHoaAction switch
    {
        "submit" => PurchaseRequestTrigger.Submit,
        "approve" => sagaState switch
        {
            "PendingDepartment" => PurchaseRequestTrigger.ApproveDepartment,
            "PendingControl" => PurchaseRequestTrigger.Approve,
            null => throw new ApiException("Phiếu chưa được submit, không thể duyệt."),
            _ => throw new ApiException($"Không thể thực hiện hành động '{action}' khi trạng thái hiện tại là '{sagaState}'")
        },
        "reject" => PurchaseRequestTrigger.Reject,
        "return" => PurchaseRequestTrigger.ReturnForEdit,
        "confirm" => PurchaseRequestTrigger.ConfirmOrder,
        _ => throw new ApiException($"Hành động '{action}' không được hệ thống hỗ trợ."),
    };
}
    }
}