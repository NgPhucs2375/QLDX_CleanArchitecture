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

        public Event<SubmitPurchaseRequestCommand> SubmitPDX { get; private set; }
        public Event<ApproveDepartmentCommand> ApproveDepartment { get; private set; }
        public Event<RejectDepartmentCommand> RejectDepartment { get; private set; }
        public Event<ApproveControlCommand> ApproveControl { get; private set; }
        public Event<RejectControlCommand> RejectControl { get; private set; }
        public Event<ReturnForEditCommand> ReturnForEdit { get; private set; }
        public Event<ConfirmOrderCommand> ConfirmOrder { get; private set; }

        public PurchaseRequestSagaStateMachine()
        {
            InstanceState(x => x.CurrentState);

            // ======== TRANSITION LOGIC ========

            Initially(
                When(SubmitPDX)
                    .Then(ctx =>
                    {
                        ctx.Saga.RequestId = ctx.Message.RequestId;
                        ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                        ctx.Saga.CreatedBy = ctx.Message.SubmittedBy;
                        ctx.Saga.CreatedAt = DateTime.UtcNow;
                    })
                    .Activity(x => x.OfType<OnSubmittedActivity>())
                    .TransitionTo(PendingDepartment)
                    .Catch<Exception>(ex => ex
                        .Then(ctx =>
                        {
                            ctx.Saga.LastErrorMessage = ctx.Exception.Message;
                            ctx.Saga.LastErrorAt = DateTime.UtcNow;
                        })
                        .TransitionTo(Submitted)
                        )
            );

            During(PendingDepartment,
                When(ApproveDepartment)
                    .Activity(x=> x.OfType<OnDepartmentApprovedActivity>())
                    .TransitionTo(PendingControl)
                    .Catch<Exception>(ex => ex
                        .Then(ctx =>
                        {
                            ctx.Saga.LastErrorMessage = ctx.Exception.Message;
                            ctx.Saga.LastErrorAt = DateTime.UtcNow;
                        })
                        .TransitionTo(PendingDepartment)
                    ),
                When(RejectDepartment)
                    .Activity(x=> x.OfType<OnDepartmentRejectedActivity>())
                    .TransitionTo(RejectedDepartment)
                    .Catch<Exception>(ex => ex
                        .TransitionTo(PendingDepartment))
                    );

            During(PendingControl,
                When(ApproveControl)
                    .Activity(x=> x.OfType<OnControlApprovedActivity>())
                    .TransitionTo(PendingOrderConfirm)
                    .Catch<Exception>(ex => ex
                        .Then(ctx =>
                        {
                            ctx.Saga.LastErrorMessage = ctx.Exception.Message;
                            ctx.Saga.LastErrorAt = DateTime.UtcNow;
                        })
                        .TransitionTo(PendingControl)
                        ),
                When(RejectControl)
                    .Activity(x=> x.OfType<OnControlRejectedActivity>())
                    .TransitionTo(RejectedControl)
                    .Catch<Exception>(ex => ex
                        .TransitionTo(PendingControl)
                        ),
                When(ReturnForEdit)
                    .Activity(x=> x.OfType<OnReturnedForEditActivity>())
                    .TransitionTo(ReturnedForEdit)
                    .Catch<Exception>(ex => ex
                        .Then(ctx =>
                        {
                            ctx.Saga.LastErrorMessage = ctx.Exception.Message;
                            ctx.Saga.LastErrorAt = DateTime.UtcNow;
                        })
                        .TransitionTo(PendingControl)
                    )
            );

            During(PendingOrderConfirm,
                When(ConfirmOrder)
                    .Then(ctx => ctx.Saga.CompletedAt = DateTime.UtcNow)
                    .Activity(x => x.OfType<OnOrderConfirmedActivity>())
                    .TransitionTo(Completed)
                    .Catch<Exception>(ex => ex
                        .Then(ctx =>
                        {
                            ctx.Saga.LastErrorMessage = ctx.Exception.Message;
                            ctx.Saga.LastErrorAt = DateTime.UtcNow;
                        })
                        .TransitionTo(PendingOrderConfirm)
                    ));

            During(ReturnedForEdit,
                When(SubmitPDX)
                    .Then(ctx =>
                    {
                        ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                        ctx.Saga.CreatedBy = ctx.Message.SubmittedBy;
                    })
                    .Activity(x => x.OfType<OnSubmittedActivity>())
                    .TransitionTo(PendingDepartment)
                    .Catch<Exception>(ex => ex
                        .Then(ctx =>
                        {
                            ctx.Saga.LastErrorMessage = ctx.Exception.Message;
                            ctx.Saga.LastErrorAt = DateTime.UtcNow;
                        })
                        .TransitionTo(ReturnedForEdit)
                    )
                   );

            // ======== CORRELATION ========

            // ============== Command ================== //
            Event(() => SubmitPDX, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.SelectId(context => context.Message.CorrelationId);
            });

            Event(() => ApproveDepartment, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m => m.Fault()); 
            });

            Event(() => RejectDepartment, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m => m.Fault());
            });

            Event(() => ApproveControl, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m => m.Fault());
            });

            Event(() => RejectControl, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m => m.Fault());
            });

            Event(() => ReturnForEdit, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m => m.Fault());
            });

            Event(() => ConfirmOrder, e =>
            {
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m => m.Fault());
            });
            
        }
    }
}