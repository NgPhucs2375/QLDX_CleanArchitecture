using Onion.CleanArchitecture.Domain.Enums;
using System;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetAllProposalConfigs
{
    public class GetAllProposalConfigsViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime EffectiveDate { get; set; }
        public ConfigurationStatus Status { get; set; }
    }
}
