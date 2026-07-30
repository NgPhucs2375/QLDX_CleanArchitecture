using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    /// <summary>
    /// Command: Yêu cầu Saga thực thi phê duyệt cấp đơn vị và chuyển trạng thái
    /// </summary>
    public record ApproveControlCommand(
        Guid CorrelationId,
        int RequestId,
        string ApprovedBy,
        DateTime ApprovedAt,
        string Note
    );
}