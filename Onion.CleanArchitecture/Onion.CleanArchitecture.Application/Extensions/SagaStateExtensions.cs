using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Application.Extensions
{
    public static class SagaStateExtensions
    {
        public static PurchaseRequestStatus MapToPurchaseRequestStatus(this string? sagaState)
        {
            return sagaState switch
            {
                null => PurchaseRequestStatus.Draft,
                "PendingDepartment" => PurchaseRequestStatus.PendingDepartment,
                "PendingControl" => PurchaseRequestStatus.PendingControl,
                "ReturnedForEdit" => PurchaseRequestStatus.ReturnedForEdit,
                "PendingOrderConfirm" => PurchaseRequestStatus.PendingOrderConfirm,
                "Completed" => PurchaseRequestStatus.Completed,
                "RejectedDepartment" => PurchaseRequestStatus.RejectedByDepartment,
                "RejectedControl" => PurchaseRequestStatus.RejectedByControl,
                _ => PurchaseRequestStatus.Draft
            };
        }
    }
}