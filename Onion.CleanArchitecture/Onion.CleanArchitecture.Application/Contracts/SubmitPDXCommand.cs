using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Command: Yêu cầu Saga bắt đầu quy trình xử lý đề xuất mua hàng
    /// </summary>
    public record SubmitPurchaseRequestCommand(
        Guid CorrelationId,
        int RequestId,
        decimal TotalAmount,
        string SubmittedBy,
        DateTime OccurredAt
    );
}