using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnDepartmentApprovedActivity: IStateMachineActivity<PurchaseRequestSaga,ApproveDepartmentCommand>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnDepartmentApprovedActivity> _logger;
        private readonly QueueSetting _queues;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IPurchaseRequestRepositoryAsync _pdxRepo;

        public OnDepartmentApprovedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnDepartmentApprovedActivity> logger,
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
            BehaviorContext<PurchaseRequestSaga, ApproveDepartmentCommand> context,
            IBehavior<PurchaseRequestSaga, ApproveDepartmentCommand> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnDepartmentApproved: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            // Laasy du lieu tu DB
            var entity = await _pdxRepo.GetByIdAsync(msg.RequestId);
            if(entity == null){
                throw new ApiException($"Không tìm thấy phiếu đề xuất với ID:{msg.RequestId}");
            }
            // check authorization
            await _workflowService.ValidateApproverForCurrentStep(entity);
            // thuc thi thay doi trang thai
            await _workflowService.ApproveByDepartmentAsync(entity,msg.Note,context.CancellationToken);
            // Save DB
            await _pdxRepo.UpdateAsync(entity);

            // 1. Gửi email command đến queue "email-department-approved"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailDepartmentApproved}"));
            await emailEndpoint.Send(new SendDepartmentApprovedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                ApprovedBy: msg.ApprovedBy,
                ApprovedAt: msg.ApprovedAt,
                Note: msg.Note,
                RecipientId: saga.CreatedBy)
            );

            //2. Gửi notification command đến queue "notify-approver"
            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyApproverByDepartment}"));
            await notiEndpoint.Send(new NotifyDepartmentApprovedCommand(
                UserId: msg.ApprovedBy,
                RequestId: msg.RequestId,
                ApprovedBy: msg.ApprovedBy,
                ApprovedAt: msg.ApprovedAt,
                Note: msg.Note,
                Message: $"Phiếu đề xuất {msg.RequestId} đã được duyệt bởi Trưởng đơn vị."
            ));

            // Chuyển ngữ cảnh cho State Machine đi tiếp
            await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, ApproveDepartmentCommand, TException> context,
            IBehavior<PurchaseRequestSaga, ApproveDepartmentCommand> next)
            where TException : Exception
        {
            _logger.LogError(
                "[Activity] OnDepartmentApproved Faulted: RequestId={RequestId}, State={State}, Exception={Exception}",
                context.Saga.RequestId, context.Saga.CurrentState, context.Exception);
            await next.Faulted(context);
        }

        public void Probe(ProbeContext context)
        {
            context.CreateScope("OnDepartmentApprovedActivity");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}