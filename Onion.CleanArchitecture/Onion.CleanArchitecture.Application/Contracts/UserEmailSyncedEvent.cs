using System;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public record UserEmailSyncedEvent(
        string UserId, // pk tuwf Identity
        string Email,  // Email
        string DisplayName, 
        string EventType, 
        DateTime OccurredAt
    );
}