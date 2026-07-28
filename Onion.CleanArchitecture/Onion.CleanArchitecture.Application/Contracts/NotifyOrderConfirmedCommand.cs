namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyOrderConfirmedCommand(
        string UserId,
        int RequestId,
        string ConfirmedBy,
        string Message
    );
}