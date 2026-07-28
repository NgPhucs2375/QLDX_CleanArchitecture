using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Kiểm soát duyệt
    /// Người nhận thông báo: Người tạo phiếu
    /// </summary>
    /// <param name="CorrelationId"></param>
    /// <param name="RequestId"></param>
    /// <param name="ApprovedBy"></param>
    /// <param name="Note"></param>
    /// <param name="OccurredAt"></param>
    public record PurchaseRequestControlApprovedEvent(
        Guid CorrelationId,
        int RequestId,
        string ApprovedBy,
        string Note,
        DateTime OccurredAt
    );
}
