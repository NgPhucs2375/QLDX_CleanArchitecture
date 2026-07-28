namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendControlRejectedEmailCommand(
        string To,
        int RequestId,
        string RejectedBy,
        string Note,
        string RecipientId
    );
}