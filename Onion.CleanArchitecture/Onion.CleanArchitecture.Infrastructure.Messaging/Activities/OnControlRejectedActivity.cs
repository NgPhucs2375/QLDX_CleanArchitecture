using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnControlRejectedActivity : IStateMachineActivity<PurchaseRequestSaga, PurchaseRequestControlRejectedEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnControlRejectedActivity> _logger;
        private readonly QueueSetting _queues;

        public OnControlRejectedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnControlRejectedActivity> logger,
            IOptions<QueueSetting> queue
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queue.Value;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestControlRejectedEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestControlRejectedEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnControlRejected: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            // 1. Gửi email command đến queue "notify-rejected-by-control"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyRejectedByControl}"));
            await emailEndpoint.Send(new SendControlRejectedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                RejectedBy: msg.RejectedBy,
                Note: msg.Note));

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
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestControlRejectedEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestControlRejectedEvent> next)
            where TException : Exception
        {
            _logger.LogError(
                "[Activity] OnControlRejected Faulted: RequestId={RequestId}, State={State}, Exception={Exception}",
                context.Saga.RequestId, context.Saga.CurrentState, context.Exception);

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
