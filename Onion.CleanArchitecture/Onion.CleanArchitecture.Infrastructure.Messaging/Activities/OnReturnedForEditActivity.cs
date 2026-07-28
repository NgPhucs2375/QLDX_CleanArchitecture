using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnReturnedForEditActivity :
        IStateMachineActivity<PurchaseRequestSaga, PurchaseRequestReturnedForEditEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnReturnedForEditActivity> _logger;
        private readonly QueueSetting _queues;

        public OnReturnedForEditActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnReturnedForEditActivity> logger,
            IOptions<QueueSetting> queues
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestReturnedForEditEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestReturnedForEditEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;

            _logger.LogInformation(
                "[Activity] OnReturnedForEdit: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

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
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestReturnedForEditEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestReturnedForEditEvent> next)
            where TException : Exception
        {
            _logger.LogError(
                context.Exception,
                "[Activity Faulted] OnReturnedForEdit: RequestId={RequestId}",
                context.Saga.RequestId);

            await next.Faulted(context);
        }

        public void Probe(ProbeContext context)
        {
            context.CreateScope("on-returned-for-edit");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}