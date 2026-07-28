using MassTransit;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Infrastructure.Messaging.Activities;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Sagas
{
    public class PurchaseRequestSagaStateMachine :
        MassTransitStateMachine<PurchaseRequestSaga>
    {
        public State Submitted { get; private set; }
        public State PendingDepartment { get; private set; }
        public State PendingControl { get; private set; }
        public State PendingOrderConfirm { get; private set; }
        public State Completed { get; private set; }
        public State RejectedDepartment { get; private set; }
        public State RejectedControl { get; private set; }
        public State ReturnedForEdit { get; private set; }

        public Event<PurchaseRequestSubmittedEvent> RequestSubmitted { get; private set; }
        public Event<PurchaseRequestDepartmentApprovedEvent> RequestDepartmentApproved { get; private set; }
        public Event<PurchaseRequestDepartmentRejectedEvent> RequestDepartmentRejected { get; private set; }
        public Event<PurchaseRequestControlApprovedEvent> RequestControlApproved { get; private set; }
        public Event<PurchaseRequestControlRejectedEvent> RequestControlRejected { get; private set; }
        public Event<PurchaseRequestReturnedForEditEvent> RequestReturnedForEdit { get; private set; }
        public Event<PurchaseRequestOrderConfirmedEvent> RequestOrderConfirmed { get; private set; }

        public PurchaseRequestSagaStateMachine()
        {
            InstanceState(x => x.CurrentState);

            // ======== TRANSITION LOGIC ========

            Initially(
                When(RequestSubmitted)
                    .Then(ctx =>
                    {
                        ctx.Saga.RequestId = ctx.Message.RequestId;
                        ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                        ctx.Saga.CreatedBy = ctx.Message.SubmittedBy;
                        ctx.Saga.CreatedAt = DateTime.UtcNow;
                    })
                    .Activity(x => x.OfType<OnSubmittedActivity>())
                    .TransitionTo(PendingDepartment)
            );

            During(PendingDepartment,
                When(RequestDepartmentApproved)
                    .Activity(x=> x.OfType<OnDepartmentApprovedActivity>())
                    .TransitionTo(PendingControl),
                When(RequestDepartmentRejected)
                    .Activity(x=> x.OfType<OnDepartmentRejectedActivity>())
                    .TransitionTo(RejectedDepartment)
                    );

            During(PendingControl,
                When(RequestControlApproved)
                    .Activity(x=> x.OfType<OnControlApprovedActivity>())
                    .TransitionTo(PendingOrderConfirm),
                When(RequestControlRejected)
                    .Activity(x=> x.OfType<OnControlRejectedActivity>())
                    .TransitionTo(RejectedControl),
                When(RequestReturnedForEdit)
                    .Activity(x=> x.OfType<OnReturnedForEditActivity>())
                    .TransitionTo(ReturnedForEdit)
            );

            During(PendingOrderConfirm,
                When(RequestOrderConfirmed)
                    .Then(ctx => ctx.Saga.CompletedAt = DateTime.UtcNow)
                    .Activity(x => x.OfType<OnOrderConfirmedActivity>())
                    .TransitionTo(Completed)
                    );

            During(ReturnedForEdit,
                When(RequestSubmitted)
                    .Then(ctx =>
                    {
                        ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                        ctx.Saga.CreatedBy = ctx.Message.SubmittedBy;
                    })
                    .Activity(x => x.OfType<OnSubmittedActivity>())
                    .TransitionTo(PendingDepartment)
                   );

            // ======== CORRELATION ========

            Event(() => RequestSubmitted, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.SelectId(context => context.Message.CorrelationId);
            });

            Event(() => RequestDepartmentApproved, e =>
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId));

            Event(() => RequestDepartmentRejected, e =>
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId));

            Event(() => RequestControlApproved, e =>
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId));

            Event(() => RequestControlRejected, e =>
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId));

            Event(() => RequestReturnedForEdit, e =>
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId));

            Event(() => RequestOrderConfirmed, e =>
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId));
        }
    }
}