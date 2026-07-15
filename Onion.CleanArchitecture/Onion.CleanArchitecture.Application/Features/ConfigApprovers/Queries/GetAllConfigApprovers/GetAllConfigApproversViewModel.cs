using Onion.CleanArchitecture.Domain.Enums;
using System;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers
{
    public class GetAllConfigApproversViewModel
    {
        public int Id { get; set; }
        public int ProposalConfigId { get; set; }
        public int DepartmentId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public ApprovalLevel Level { get; set; }
    }
}
