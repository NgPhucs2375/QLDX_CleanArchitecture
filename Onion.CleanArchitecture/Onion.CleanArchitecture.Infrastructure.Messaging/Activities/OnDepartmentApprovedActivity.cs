using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnDepartmentApprovedActivity: IStateMachineActivity<PurchaseRequestSaga,PurchaseRequestDepartmentApprovedEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnDepartmentApprovedActivity> _logger;
        private readonly QueueSetting _queues;

        public OnDepartmentApprovedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnDepartmentApprovedActivity> logger,
            IOptions<QueueSetting> queues
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestDepartmentApprovedEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestDepartmentApprovedEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnDepartmentApproved: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

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
            await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestDepartmentApprovedEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestDepartmentApprovedEvent> next)
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