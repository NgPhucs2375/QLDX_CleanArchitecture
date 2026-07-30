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
    public class OnDepartmentRejectedActivity :
        IStateMachineActivity<PurchaseRequestSaga, RejectDepartmentCommand>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnDepartmentRejectedActivity> _logger;
        private readonly QueueSetting _queues;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IPurchaseRequestRepositoryAsync _pdxRepo;


        public OnDepartmentRejectedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnDepartmentRejectedActivity> logger,
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
            BehaviorContext<PurchaseRequestSaga, RejectDepartmentCommand> context,
            IBehavior<PurchaseRequestSaga, RejectDepartmentCommand> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnDepartmentRejected: RequestId={RequestId}, State={State}",
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
            await _workflowService.RejectedByDepartmentAsync(entity,msg.Note,context.CancellationToken);
            // Save DB
            await _pdxRepo.UpdateAsync(entity);


            // 1. Gửi email command đến queue "email-department-rejected"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailDepartmentRejected}"));
            await emailEndpoint.Send(new SendDepartmentRejectedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                RejectedBy: msg.RejectedBy,
                Note: msg.Note,
                RecipientId: saga.CreatedBy
            ));

            // 2. Gửi notification command đến queue "notify-rejected-by-department"
            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyRejectedByDepartment}"));
            await notiEndpoint.Send(new NotifyDepartmentRejectedCommand(
                UserId: msg.RejectedBy,
                RequestId: msg.RequestId,
                RejectedBy: msg.RejectedBy,
                Note: msg.Note,
                Message: $"Phiếu #{msg.RequestId} đã bị từ chối bởi Trưởng đơn vị."
            ));
            await next.Execute(context);
        }
        
        
        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, RejectDepartmentCommand, TException> context,
            IBehavior<PurchaseRequestSaga, RejectDepartmentCommand> next)
            where TException : Exception
        {
            _logger.LogError(
                context.Exception,
                "[Activity] OnDepartmentRejected Faulted: RequestId={RequestId}, State={State}",
                context.Saga.RequestId, context.Saga.CurrentState);

                try
            {
                // 1. Truy xuất thực thể từ cơ sở dữ liệu
                var entity = await _pdxRepo.GetByIdAsync(context.Message.RequestId);
                
                if (entity != null && entity.Status == PurchaseRequestStatus.RejectedByDepartment)
                {
                    _logger.LogWarning("[Compensation] Thực thi Rollback dữ liệu DB cho RequestId={RequestId}", entity.Id);
                    
                    entity.Status = PurchaseRequestStatus.PendingDepartment; 
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
            context.CreateScope("OnDepartmentRejectedActivity");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}

