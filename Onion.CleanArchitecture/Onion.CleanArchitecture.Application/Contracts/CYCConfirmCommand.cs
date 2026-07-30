using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Command: Yêu cầu Saga thực thi xác nhận đơn hàng hoàn tất
    /// </summary>
    public record ConfirmOrderCommand(
        Guid CorrelationId,
        int RequestId,
        string ConfirmedBy,
        DateTime ConfirmedAt
    );
}