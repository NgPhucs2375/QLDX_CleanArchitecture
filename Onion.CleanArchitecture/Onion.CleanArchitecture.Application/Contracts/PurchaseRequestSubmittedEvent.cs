using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Publisher: Khi user submit
    /// Người nhận thông báo: Trưởng đơn vị
    /// </summary>
    /// <param name="CorrelationId"></param>
    /// <param name="RequestId"></param>
    /// <param name="TotalAmount"></param>
    /// <param name="SubmittedBy"></param>
    /// <param name="OccurredAt"></param>
    // Contract cho sự kiện Duyệt Yêu cầu Mua hàng đã được gửi
    public record PurchaseRequestSubmittedEvent(
        Guid CorrelationId, // ID duy nhất theo dõi sự kiện xuyên suốt vòng đời của hợp đồng
        int RequestId, // ID của yêu cầu mua hàng đã được gửi
        decimal TotalAmount, // Tổng số tiền của yêu cầu mua hàng
        string SubmittedBy, // Tên người dùng đã gửi yêu cầu mua hàng
        DateTime OccurredAt // Thời điểm sự kiện xảy ra
    );
}
