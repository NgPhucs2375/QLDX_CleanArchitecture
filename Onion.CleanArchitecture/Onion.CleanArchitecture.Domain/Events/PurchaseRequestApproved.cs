namespace Onion.CleanArchitecture.Domain.Events{
    public record PurchaseRequestApproved(
    int RequestId,
    string ApprovedBy,
    string ApprovalLevel, // "Department" | "Control"
    string Note
);
}