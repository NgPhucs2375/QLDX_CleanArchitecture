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
    public class OnReturnedForEditActivity :
        IStateMachineActivity<PurchaseRequestSaga, ReturnForEditCommand>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnReturnedForEditActivity> _logger;
        private readonly QueueSetting _queues;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IPurchaseRequestRepositoryAsync _pdxRepo;


        public OnReturnedForEditActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnReturnedForEditActivity> logger,
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
            BehaviorContext<PurchaseRequestSaga, ReturnForEditCommand> context,
            IBehavior<PurchaseRequestSaga, ReturnForEditCommand> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnReturnedForEdit: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            var entity = await _pdxRepo.GetByIdAsync(msg.RequestId);
            if(entity == null){
                throw new ApiException($"Không tìm thấy phiếu đề xuất với ID:{msg.RequestId}");
            }
            // thuc thi thay doi trang thai
            await _workflowService.ReturnForEditByControlAsync(entity,msg.Note,context.CancellationToken);
            // Save DB
            await _pdxRepo.UpdateAsync(entity);


            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailReturnedForEdit}"));
            await emailEndpoint.Send(new SendReturnedForEditEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                ReturnedBy: msg.ReturnedBy,
                ReturnedAt: msg.ReturnAt,
                Note: msg.Note,
                RecipientId: saga.CreatedBy
            ));

            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyReturnedForEdit}"));
            await notiEndpoint.Send(new NotifyReturnedForEditCommand(
                UserId: msg.SubmittedBy,
                RequestId: msg.RequestId,
                ReturnedBy: msg.ReturnedBy,
                Note: msg.Note,
                Message: $"Phiếu #{msg.RequestId} đã bị trả về để chỉnh sửa bởi {msg.ReturnedBy}."
            ));

            await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, ReturnForEditCommand, TException> context,
            IBehavior<PurchaseRequestSaga, ReturnForEditCommand> next)
            where TException : Exception
        {
            _logger.LogError(
                context.Exception,
                "[Activity Faulted] OnReturnedForEdit: RequestId={RequestId}",
                context.Saga.RequestId);

            try
    {
        // 1. Truy xuất thực thể từ cơ sở dữ liệu
        var entity = await _pdxRepo.GetByIdAsync(context.Message.RequestId);
        
        // 2. Logic Đền bù: Kiểm tra bất đồng bộ dữ liệu bằng Type-Safe Enum
        // Nếu DB đã đi lố sang trạng thái của bước tiếp theo (PendingControl) do các lệnh phía sau (như gửi Email) gây crash
        if (entity != null && entity.Status == PurchaseRequestStatus.PendingDepartment)
        {
            _logger.LogWarning("[Compensation] Thực thi Rollback dữ liệu DB cho RequestId={RequestId}", entity.Id);
            
            // 3. Khôi phục trạng thái DB về nguyên bản bằng Enum
            entity.Status = PurchaseRequestStatus.ReturnedForEdit; 
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
            context.CreateScope("OnReturnedForEditActivity");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}