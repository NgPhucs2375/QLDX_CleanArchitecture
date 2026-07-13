using System;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories
{
    public class GetAllConfigCategoriesViewModel
    {
        public int Id { get; set; }
        public Guid ProposalConfigId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid DepartmentId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal UsedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
    }
}
