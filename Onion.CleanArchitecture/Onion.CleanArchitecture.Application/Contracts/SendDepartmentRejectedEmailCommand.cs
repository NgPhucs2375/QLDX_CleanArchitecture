namespace Onion.CleanArchitecture.Application.Contracts
{
    public record SendDepartmentRejectedEmailCommand(
        string To,
        int RequestId,
        string RejectedBy,
        string Note
    );
}