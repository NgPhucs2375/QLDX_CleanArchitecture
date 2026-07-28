namespace Onion.CleanArchitecture.Domain.Settings
{
    public class QueueSetting
    {
        public string EmailSubmitted { get; set; } = "email-submitted";
        public string NotifyApprover { get; set; } = "notify-approver";
        public string EmailDepartmentApproved { get; set; } = "email-department-approved";
        public string NotifyApproverByDepartment { get; set; } = "notify-approver-by-department";
        public string EmailDepartmentRejected { get; set; } = "email-department-rejected";
        public string NotifyRejectedByDepartment { get; set; } = "notify-rejected-by-department";
        public string EmailControlApproved { get; set; } = "email-control-approved";
        public string NotifyApproverByControl { get; set; } = "notify-approver-by-control";
        public string EmailControlRejected { get; set; } = "email-control-rejected";
        public string NotifyRejectedByControl { get; set; } = "notify-rejected-by-control";
        public string EmailOrderConfirmed { get; set; } = "email-order-confirmed";
        public string NotifyOrderConfirmed { get; set; } = "notify-order-confirmed";
        public string EmailReturnedForEdit { get; set; } = "email-returned-for-edit";
        public string NotifyReturnedForEdit { get; set; } = "notify-returned-for-edit";
        public string EmailAudit { get; set; } = "email-audit";
        public string UserEmailSync { get; set; } = "user-email-sync";
    }
}