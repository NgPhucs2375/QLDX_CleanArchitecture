namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyApproverCommand(
        string UserId,
        int RequestId,
        string Message
    );
}