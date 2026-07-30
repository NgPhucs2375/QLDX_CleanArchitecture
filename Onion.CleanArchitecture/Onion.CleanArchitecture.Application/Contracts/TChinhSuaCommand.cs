using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Command: Yêu cầu Saga thực thi trả phiếu về để người tạo chỉnh sửa
    /// </summary>
    public record ReturnForEditCommand(
        Guid CorrelationId,
        int RequestId,
        string ReturnedBy,
        DateTime ReturnAt,
        decimal TotalAmount,
        string Note
    );
}