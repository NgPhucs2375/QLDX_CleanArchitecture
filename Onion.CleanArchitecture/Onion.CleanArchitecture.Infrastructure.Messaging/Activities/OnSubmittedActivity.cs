using MassTransit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Activities
{
    public class OnSubmittedActivity :
        IStateMachineActivity<PurchaseRequestSaga, PurchaseRequestSubmittedEvent>
    {
        private readonly ISendEndpointProvider _sendEndpointProvider;
        private readonly ILogger<OnSubmittedActivity> _logger;
        private readonly QueueSetting _queues;
        private readonly IPurchaseRequestRepositoryAsync _pdxRepo;

        public OnSubmittedActivity(
            ISendEndpointProvider sendEndpointProvider,
            ILogger<OnSubmittedActivity> logger,
            IOptions<QueueSetting> queues,
            IPurchaseRequestRepositoryAsync pdxRepo
            )
        {
            _sendEndpointProvider = sendEndpointProvider;
            _logger = logger;
            _queues = queues.Value;
            _pdxRepo = pdxRepo;
        }

        public async Task Execute(
            BehaviorContext<PurchaseRequestSaga, PurchaseRequestSubmittedEvent> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestSubmittedEvent> next)
        {
            var saga = context.Saga;
            var msg = context.Message;
            var entity = await _pdxRepo.GetByIdAsync(saga.RequestId);
            if (entity != null){
                entity.Status = PurchaseRequestStatus.PendingDepartment;
                await _pdxRepo.UpdateAsync(entity);
            }

            _logger.LogInformation(
                "[Activity] OnSubmitted: RequestId={RequestId}, State={State}",
                saga.RequestId, saga.CurrentState);

            // 1. Gửi email command đến queue "email-submitted"
            var emailEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.EmailSubmitted}"));
            await emailEndpoint.Send(new SendSubmittedEmailCommand(
                To: "tranphuc2375@gmail.com",
                RequestId: msg.RequestId,
                TotalAmount: msg.TotalAmount,
                SubmittedBy: msg.SubmittedBy,
                RecipientId: saga.CreatedBy
            ));

            // 2. Gửi notification command đến queue "notify-approver"
            var notiEndpoint = await _sendEndpointProvider.GetSendEndpoint(
                new Uri($"queue:{_queues.NotifyApprover}"));
            await notiEndpoint.Send(new NotifyApproverCommand(
                UserId: msg.SubmittedBy,
                RequestId: msg.RequestId,
                Message: $"Bạn có phiếu #{msg.RequestId} cần duyệt."
            ));

            await next.Execute(context);
        }

        public async Task Faulted<TException>(
            BehaviorExceptionContext<PurchaseRequestSaga, PurchaseRequestSubmittedEvent, TException> context,
            IBehavior<PurchaseRequestSaga, PurchaseRequestSubmittedEvent> next)
            where TException : Exception
        {
            _logger.LogError(
                context.Exception,
                "[Activity Faulted] OnSubmitted: RequestId={RequestId}",
                context.Saga.RequestId);

            await next.Faulted(context);
        }

        public void Probe(ProbeContext context)
        {
            context.CreateScope("on-submitted");
        }

        public void Accept(StateMachineVisitor visitor)
        {
            visitor.Visit(this);
        }
    }
}