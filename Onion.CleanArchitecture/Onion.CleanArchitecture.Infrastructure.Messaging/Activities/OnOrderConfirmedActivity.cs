using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnOrderConfirmedActivity :
        IStateMachineActivity<PurchaseRequestSaga, PurchaseRequestOrderConfirmedEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnOrderConfirmedActivity> _logger;
        private readonly QueueSetting _queues;

        public OnOrderConfirmedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnOrderConfirmedActivity> logger,
            IOptions<QueueSetting> queues
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestOrderConfirmedEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestOrderConfirmedEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnOrderConfirmed: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailOrderConfirmed}"));
            await emailEndpoint.Send(new SendOrderConfirmedEmailCommand(
                To: "all@example.com",
                RequestId: msg.RequestId,
                ConfirmedBy: msg.ConfirmedBy,
                ConfirmedAt: msg.ConfirmedAt
            ));

            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyOrderConfirmed}"));
            await notiEndpoint.Send(new NotifyOrderConfirmedCommand(
                UserId: msg.SubmittedBy,
                RequestId: msg.RequestId,
                ConfirmedBy: msg.ConfirmedBy,
                Message: $"Phiếu #{msg.RequestId} đã được {msg.ConfirmedBy} xác nhận hoàn thành."
            ));

            await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestOrderConfirmedEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestOrderConfirmedEvent> next)
            where TException : Exception
        {
            _logger.LogError(
                context.Exception,
                "[Activity Faulted] OnOrderConfirmed: RequestId={RequestId}",
                context.Saga.RequestId);

            await next.Faulted(context);
        }

        public void Probe(ProbeContext context)
        {
            context.CreateScope("on-order-confirmed");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}