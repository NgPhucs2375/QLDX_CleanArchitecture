using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendDepartmentApprovedEmailCommand(
        string To,
        int RequestId,
        string ApprovedBy,
        DateTime ApprovedAt,
        string Note,
        string RecipientId
    );
}