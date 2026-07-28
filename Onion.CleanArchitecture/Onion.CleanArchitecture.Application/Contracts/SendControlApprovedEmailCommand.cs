namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendControlApprovedEmailCommand(
        string To,
        int RequestId,
        string ApprovedBy,
        string Note
    );
}