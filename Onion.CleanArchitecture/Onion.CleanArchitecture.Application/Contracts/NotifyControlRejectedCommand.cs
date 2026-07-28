namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyControlRejectedCommand(
        string UserId,
        int RequestId,
        string RejectedBy,
        string Note,
        string Message
    );
}