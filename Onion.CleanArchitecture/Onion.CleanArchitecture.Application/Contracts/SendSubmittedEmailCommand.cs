namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendSubmittedEmailCommand(
        string To,
        int RequestId,
        decimal TotalAmount,
        string SubmittedBy
    );
}