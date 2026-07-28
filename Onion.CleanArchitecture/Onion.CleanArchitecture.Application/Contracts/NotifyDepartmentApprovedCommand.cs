using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyDepartmentApprovedCommand(
        string UserId,
        int RequestId,
        string ApprovedBy,
        DateTime ApprovedAt,
        string Note,
        string Message
    );
}