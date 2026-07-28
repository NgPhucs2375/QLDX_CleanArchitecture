using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnControlApprovedActivity : IStateMachineActivity<PurchaseRequestSaga, PurchaseRequestControlApprovedEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnControlApprovedActivity> _logger;
        private readonly QueueSetting _queues;

        public OnControlApprovedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnControlApprovedActivity> logger,
            IOptions<QueueSetting> queues
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestControlApprovedEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestControlApprovedEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnControlApproved: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

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
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestControlApprovedEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestControlApprovedEvent> next)
            where TException : Exception
        {
            _logger.LogError(
                "[Activity] OnControlApproved Faulted: RequestId={RequestId}, State={State}, Exception={Exception}",
                context.Saga.RequestId, context.Saga.CurrentState, context.Exception);

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
