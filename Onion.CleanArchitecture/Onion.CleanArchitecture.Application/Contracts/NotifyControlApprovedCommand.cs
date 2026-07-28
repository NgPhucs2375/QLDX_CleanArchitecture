namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyControlApprovedCommand(
        string UserId,
        int RequestId,
        string ApprovedBy,
        string Note,
        string Message
    );
}