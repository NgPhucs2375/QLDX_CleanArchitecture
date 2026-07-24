using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record PurchaseRequestOrderConfirmedEvent(
        Guid CorrelationId,
        int RequestId,
        string ConfirmedBy,
        DateTime OccurredAt
    );
}
