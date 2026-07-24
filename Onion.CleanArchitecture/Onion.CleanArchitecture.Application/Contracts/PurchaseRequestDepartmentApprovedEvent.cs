using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record PurchaseRequestDepartmentApprovedEvent(
        Guid CorrelationId,
        int RequestId,
        string ApprovedBy,
        string Note,
        DateTime OccurredAt
    );
}
