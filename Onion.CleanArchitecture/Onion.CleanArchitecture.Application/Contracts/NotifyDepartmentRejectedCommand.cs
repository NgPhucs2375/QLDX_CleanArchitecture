namespace Onion.CleanArchitecture.Application.Contracts
{
    public record NotifyDepartmentRejectedCommand(
        string UserId,
        int RequestId,
        string RejectedBy,
        string Note,
        string Message
    );
}