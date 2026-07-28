using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Trưởng đơn vị duyệt
    /// Người nhận thông báo: kiểm soát
    /// </summary>
    public record PurchaseRequestDepartmentApprovedEvent(
        Guid CorrelationId,
        int RequestId,
        string ApprovedBy,
        DateTime ApprovedAt,
        string Note
    );
}
