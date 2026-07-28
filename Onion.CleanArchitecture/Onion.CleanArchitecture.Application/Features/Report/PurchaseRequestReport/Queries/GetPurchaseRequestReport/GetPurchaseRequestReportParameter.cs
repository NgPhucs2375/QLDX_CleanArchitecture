// (filter params từ query string)
using System;
using Onion.CleanArchitecture.Application.Filters;

namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport{
    ///<summary>
    /// Use to get filter params from query string for GetPurchaseRequestReportQuery
    /// </summary>
    public class GetPurchaseRequestReportParameter: RequestParameter
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? DepartmentId { get; set; }
        public int? Status { get; set; }           // PurchaseRequestStatus
        public int? CategoryId { get; set; }       // Lọc theo danh mục (ảnh hưởng đến detail)

    }
}