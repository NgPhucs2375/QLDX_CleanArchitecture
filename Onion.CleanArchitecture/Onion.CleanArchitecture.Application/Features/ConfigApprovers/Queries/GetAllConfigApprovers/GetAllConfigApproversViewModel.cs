using Onion.CleanArchitecture.Domain.Enums;
using System;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers
{
    public class GetAllConfigApproversViewModel
    {
        public int Id { get; set; }
        public Guid ProposalConfigId { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid ApproverId { get; set; }
        public ApprovalLevel Level { get; set; }
    }
}
