using System.Collections.Generic;
using System.Threading.Tasks;
using Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport;
using Onion.CleanArchitecture.Application.Wrappers;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestReportRepositoryAsync
    {
        // Dapper query
        Task<KpiSummaryDto> GetKpiSummaryAsync(GetPurchaseRequestReportParameter filter);
        Task<List<TrendDataDto>> GetTrendDataAsync(GetPurchaseRequestReportParameter filter);
        Task<List<CategoryDistributionDto>> GetCategoryDistributionAsync(GetPurchaseRequestReportParameter filter);
        Task<List<DepartmentStatusDto>> GetDepartmentStatusAsync(GetPurchaseRequestReportParameter filter);
        Task<PagedList<RequestDetailDto>> GetRequestDetailsAsync(GetPurchaseRequestReportParameter filter);
    }
}