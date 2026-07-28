namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyReturnedForEditCommand(
        string UserId,
        int RequestId,
        string ReturnedBy,
        string Note,
        string Message
    );
}