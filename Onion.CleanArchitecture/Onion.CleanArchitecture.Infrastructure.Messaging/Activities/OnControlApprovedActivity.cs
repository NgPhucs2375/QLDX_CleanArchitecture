using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnControlApprovedActivity : IStateMachineActivity<PurchaseRequestSaga, ApproveControlCommand>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnControlApprovedActivity> _logger;
        private readonly QueueSetting _queues;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IPurchaseRequestRepositoryAsync _pdxRepo;
        public OnControlApprovedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnControlApprovedActivity> logger,
            IOptions<QueueSetting> queues,
            IPurchaseRequestWorkflowService workflowService,
            IPurchaseRequestRepositoryAsync pdxRepo
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
            _workflowService = workflowService;
            _pdxRepo = pdxRepo;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, ApproveControlCommand> context,
            IBehavior<PurchaseRequestSaga, ApproveControlCommand> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            var entity = await _pdxRepo.GetByIdAsync(msg.RequestId);
            if(entity == null){
                throw new ApiException($"Không tìm thấy phiếu đề xuất với ID:{msg.RequestId}");
            }


            _logger.LogInformation(
                "[Activity] OnControlApproved: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            // check authorization
            await _workflowService.ValidateApproverForCurrentStep(entity);
            // thuc thi thay doi trang thai
            await _workflowService.ApproveByControlAsync(entity,msg.Note,context.CancellationToken);
            // Save DB
            await _pdxRepo.UpdateAsync(entity);


            // 1. Gửi email command đến queue "email-control-approved"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailControlApproved}"));
            await emailEndpoint.Send(new SendControlApprovedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                ApprovedBy: msg.ApprovedBy,
                Note: msg.Note,
                RecipientId: saga.CreatedBy));

            // 2. Gửi notification command đến queue "notify-approver-by-control"
            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyApproverByControl}"));
            await notiEndpoint.Send(new NotifyControlApprovedCommand(
                UserId: msg.ApprovedBy,
                RequestId: msg.RequestId,
                ApprovedBy: msg.ApprovedBy,
                Note: msg.Note,
                Message: $"Phiếu #{msg.RequestId} đã được duyệt bởi Control."));
                await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, ApproveControlCommand, TException> context,
            IBehavior<PurchaseRequestSaga, ApproveControlCommand> next)
            where TException : Exception
        {
            _logger.LogError(
                "[Activity] OnControlApproved Faulted: RequestId={RequestId}, State={State}, Exception={Exception}",
                context.Saga.RequestId, context.Saga.CurrentState, context.Exception);

            try
            {
                // 1. Truy xuất thực thể từ cơ sở dữ liệu
                var entity = await _pdxRepo.GetByIdAsync(context.Message.RequestId);
                
                // 2. Logic Đền bù: Kiểm tra bất đồng bộ dữ liệu bằng Type-Safe Enum
                // Nếu DB đã đi lố sang trạng thái của bước tiếp theo (PendingControl) do các lệnh phía sau (như gửi Email) gây crash
                if (entity != null && entity.Status == PurchaseRequestStatus.PendingOrderConfirm)
                {
                    _logger.LogWarning("[Compensation] Thực thi Rollback dữ liệu DB cho RequestId={RequestId}", entity.Id);
                    
                    // 3. Khôi phục trạng thái DB về nguyên bản bằng Enum
                    entity.Status = PurchaseRequestStatus.PendingControl; 
                    await _pdxRepo.UpdateAsync(entity);
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "[Critical] Tiến trình Rollback DB thất bại nghiêm trọng cho RequestId={RequestId}", context.Saga.RequestId);
            }

            // 4. Ủy thác lỗi cho State Machine để khối .Catch kích hoạt Rollback Saga State
            await next.Faulted(context);
        }

        public void Probe(ProbeContext context)
        {
            context.CreateScope("OnControlApprovedActivity");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}
