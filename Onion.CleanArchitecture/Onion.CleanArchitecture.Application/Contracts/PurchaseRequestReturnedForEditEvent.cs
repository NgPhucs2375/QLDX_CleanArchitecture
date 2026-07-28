using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Kiểm soát trả về để chỉnh sửa
    /// Người nhận thông báo: Người tạo phiếu
    /// </summary>
    public record PurchaseRequestReturnedForEditEvent(
        Guid CorrelationId,
        int RequestId,
        string ReturnedBy,
        DateTime ReturnAt,
        decimal TotalAmount,
        string SubmittedBy,
        string Note
    );
}
