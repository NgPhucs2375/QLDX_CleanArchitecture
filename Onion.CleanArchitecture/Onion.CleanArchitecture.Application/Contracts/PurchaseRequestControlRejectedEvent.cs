using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Kiểm soát từ chối
    /// Người nhận thông báo: Người tạo phiếu
    /// </summary>
    public record PurchaseRequestControlRejectedEvent(
        Guid CorrelationId,
        int RequestId,
        string RejectedBy,
        string Note,
        DateTime OccurredAt
    );
}
