using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Command: Yêu cầu Saga thực thi từ chối cấp đơn vị
    /// </summary>
    public record RejectControlCommand(
        Guid CorrelationId,
        int RequestId,
        string RejectedBy,
        string Note,
        DateTime OccurredAt
    );
}