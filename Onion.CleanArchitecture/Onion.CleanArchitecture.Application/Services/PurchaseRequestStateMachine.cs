using Stateless;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Application.Services
{
    public class PurchaseRequestStateMachine
    {
        private readonly StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger> _machine;
        private readonly PurchaseRequest _entity;

        public PurchaseRequestStateMachine(PurchaseRequest entity)
        {
            _entity = entity;
            _machine = new StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger>(
                () => _entity.Status,
                s => _entity.Status = s
            );

            _machine.Configure(PurchaseRequestStatus.Draft)
                .Permit(PurchaseRequestTrigger.Submit, PurchaseRequestStatus.PendingDepartment);

            _machine.Configure(PurchaseRequestStatus.PendingDepartment)
                .Permit(PurchaseRequestTrigger.ApproveDepartment, PurchaseRequestStatus.PendingControl)
                .Permit(PurchaseRequestTrigger.Reject, PurchaseRequestStatus.RejectedByDepartment);

            _machine.Configure(PurchaseRequestStatus.PendingControl)
                .Permit(PurchaseRequestTrigger.Approve, PurchaseRequestStatus.Approved)
                .Permit(PurchaseRequestTrigger.Reject, PurchaseRequestStatus.RejectedByControl)
                .Permit(PurchaseRequestTrigger.ReturnForEdit, PurchaseRequestStatus.ReturnedForEdit);

            _machine.Configure(PurchaseRequestStatus.ReturnedForEdit)
                .Permit(PurchaseRequestTrigger.Submit, PurchaseRequestStatus.PendingDepartment);

            _machine.Configure(PurchaseRequestStatus.Approved)
                .Permit(PurchaseRequestTrigger.ConfirmOrder, PurchaseRequestStatus.PendingOrderConfirm);

            _machine.Configure(PurchaseRequestStatus.PendingOrderConfirm)
                .Permit(PurchaseRequestTrigger.Complete, PurchaseRequestStatus.Completed);

            _machine.Configure(PurchaseRequestStatus.Completed);
            _machine.Configure(PurchaseRequestStatus.RejectedByDepartment);
            _machine.Configure(PurchaseRequestStatus.RejectedByControl);
        }

        public bool CanFire(PurchaseRequestTrigger trigger) => _machine.CanFire(trigger);
        public void Fire(PurchaseRequestTrigger trigger) => _machine.Fire(trigger);
    }

}
