using System;

namespace Onion.CleanArchitecture.Domain.Events
{
    public record PurchaseRequestSubmitted
    (
        int RequestId,
        decimal TotalAmount,
        string SubmittedBy,
        DateTime SubmittedAt
    );
}