using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record RequestSyncEvent(
        string RequesterId,
        DateTime RequestedAt
    );
}