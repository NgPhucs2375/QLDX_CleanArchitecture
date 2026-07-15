namespace Onion.CleanArchitecture.Domain.Enums
{
    public enum PurchaseRequestTrigger
    {
        Submit = 1,            // Draft → PendingDepartment
        ApproveDepartment = 2, // PendingDepartment → PendingControl
        Reject = 3,            // PendingDepartment → RejectedByDepartment, PendingControl → RejectedByControl
        ReturnForEdit = 4,     // PendingControl → ReturnedForEdit
        Approve = 5,           // PendingControl → Approved
        ConfirmOrder = 6,      // Approved → PendingOrderConfirm
        Complete = 7           // PendingOrderConfirm → Completed
    }
}