using System;

namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class RequestDetailDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string DepartmentName { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; }
        public decimal TotalProposedAmount { get; set; }
    }
}