using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Trưởng đơn vị Từ chối
    /// Người nhận thông báo: Người tạo phiếu
    /// </summary>
    public record PurchaseRequestDepartmentRejectedEvent(
        Guid CorrelationId,
        int RequestId,
        string RejectedBy,
        string Note,
        DateTime OccurredAt
    );
}
