using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendReturnedForEditEmailCommand(
        string To,
        int RequestId,
        string ReturnedBy,
        DateTime ReturnedAt,
        string Note,
        string RecipientId
    );
}