// (response DTOs)
using System.Collections.Generic;
using Onion.CleanArchitecture.Application.Wrappers;

namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class GetPurchaseRequestReportViewModel{
        public KpiSummaryDto Kpis { get; set; }                        // 4 thẻ KPI
        public List<TrendDataDto> TrendData { get; set; }              // Line Chart
        public List<CategoryDistributionDto> CategoryDistribution { get; set; } // Donut Chart
        public List<DepartmentStatusDto> DepartmentStatus { get; set; }       // Stacked Bar
        public PagedList<RequestDetailDto> Details { get; set; }       // Data Grid
    }
}