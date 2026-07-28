using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendOrderConfirmedEmailCommand(
        string To,
        int RequestId,
        string ConfirmedBy,
        DateTime ConfirmedAt
    );
}