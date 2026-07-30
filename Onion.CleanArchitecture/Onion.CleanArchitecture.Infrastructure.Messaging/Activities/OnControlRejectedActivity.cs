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
    public class OnControlRejectedActivity : IStateMachineActivity<PurchaseRequestSaga, RejectControlCommand>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnControlRejectedActivity> _logger;
        private readonly QueueSetting _queues;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IPurchaseRequestRepositoryAsync _pdxRepo;


        public OnControlRejectedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnControlRejectedActivity> logger,
            IOptions<QueueSetting> queue,
            IPurchaseRequestWorkflowService workflowService,
            IPurchaseRequestRepositoryAsync pdxRepo
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queue.Value;
            _workflowService = workflowService;
            _pdxRepo = pdxRepo;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, RejectControlCommand> context,
            IBehavior<PurchaseRequestSaga, RejectControlCommand> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnControlRejected: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            var entity = await _pdxRepo.GetByIdAsync(msg.RequestId);
            if(entity == null){
                throw new ApiException($"Không tìm thấy phiếu đề xuất với ID:{msg.RequestId}");
            }

            if (string.IsNullOrEmpty(msg.Note))
            {
                throw new ApiException($"Ghi chú từ chối không được để trống.");
            }
                        // check authorization
            await _workflowService.ValidateApproverForCurrentStep(entity);
            // thuc thi thay doi trang thai
            await _workflowService.RejectedByControlAsync(entity,msg.Note,context.CancellationToken);
            // Save DB
            await _pdxRepo.UpdateAsync(entity);



            // 1. Gửi email command đến queue "notify-rejected-by-control"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyRejectedByControl}"));
            await emailEndpoint.Send(new SendControlRejectedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                RejectedBy: msg.RejectedBy,
                Note: msg.Note,
                RecipientId: saga.CreatedBy));

            // 2. Gửi notification command đến queue "notify-approver-by-control"
            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyRejectedByControl}"));
            await notiEndpoint.Send(new NotifyControlRejectedCommand(
                UserId: msg.RejectedBy,
                RequestId: msg.RequestId,
                RejectedBy: msg.RejectedBy,
                Note: msg.Note,
                Message: $"Phiếu #{msg.RequestId} đã được từ chối bởi Control."));
                await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, RejectControlCommand, TException> context,
            IBehavior<PurchaseRequestSaga, RejectControlCommand> next)
            where TException : Exception
        {
            _logger.LogError(
                "[Activity] OnControlRejected Faulted: RequestId={RequestId}, State={State}, Exception={Exception}",
                context.Saga.RequestId, context.Saga.CurrentState, context.Exception);
            try
            {
                // 1. Truy xuất thực thể từ cơ sở dữ liệu
                var entity = await _pdxRepo.GetByIdAsync(context.Message.RequestId);
                
                // 2. Logic Đền bù: Kiểm tra bất đồng bộ dữ liệu bằng Type-Safe Enum
                // Nếu DB đã đi lố sang trạng thái của bước tiếp theo (PendingControl) do các lệnh phía sau (như gửi Email) gây crash
                if (entity != null && entity.Status == PurchaseRequestStatus.RejectedByControl)
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
            context.CreateScope("OnControlRejectedActivity");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}
