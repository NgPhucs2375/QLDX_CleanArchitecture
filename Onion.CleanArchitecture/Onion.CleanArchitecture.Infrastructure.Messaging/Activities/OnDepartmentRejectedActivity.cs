using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnDepartmentRejectedActivity :
        IStateMachineActivity<PurchaseRequestSaga, PurchaseRequestDepartmentRejectedEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnDepartmentRejectedActivity> _logger;
        private readonly QueueSetting _queues;

        public OnDepartmentRejectedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnDepartmentRejectedActivity> logger,
            IOptions<QueueSetting> queues
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestDepartmentRejectedEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestDepartmentRejectedEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnDepartmentRejected: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            // 1. Gửi email command đến queue "email-department-rejected"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailDepartmentRejected}"));
            await emailEndpoint.Send(new SendDepartmentRejectedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                RejectedBy: msg.RejectedBy,
                Note: msg.Note
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
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestDepartmentRejectedEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestDepartmentRejectedEvent> next)
            where TException : Exception
        {
            _logger.LogError(
                context.Exception,
                "[Activity] OnDepartmentRejected Faulted: RequestId={RequestId}, State={State}",
                context.Saga.RequestId, context.Saga.CurrentState);

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

