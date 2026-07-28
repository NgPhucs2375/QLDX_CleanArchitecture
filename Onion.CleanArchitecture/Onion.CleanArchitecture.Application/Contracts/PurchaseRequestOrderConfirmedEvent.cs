using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Creator Xác nhận
    /// Người nhận thông báo: ALL
    /// </summary>
    public record PurchaseRequestOrderConfirmedEvent(
        Guid CorrelationId,
        int RequestId,
        string ConfirmedBy,
        DateTime ConfirmedAt,
        decimal TotalAmount,
        string SubmittedBy
    );
}
