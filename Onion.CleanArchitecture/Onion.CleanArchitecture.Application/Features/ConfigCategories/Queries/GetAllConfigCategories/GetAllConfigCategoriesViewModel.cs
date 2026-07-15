using System;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories
{
    public class GetAllConfigCategoriesViewModel
    {
        public int Id { get; set; }
        public int ProposalConfigId { get; set; }
        public int CategoryId { get; set; }
        public int DepartmentId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal UsedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
    }
}
