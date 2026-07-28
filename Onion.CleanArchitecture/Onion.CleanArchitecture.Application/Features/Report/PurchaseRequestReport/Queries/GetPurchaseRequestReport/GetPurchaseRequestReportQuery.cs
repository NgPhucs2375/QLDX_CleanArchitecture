//IRequest
using System;
using MassTransit;
using MediatR;

namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class GetPurchaseRequestReportQuery : IRequest<Response<GetPurchaseRequestReportViewModel>>
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? DepartmentId { get; set; }
        public int? Status { get; set; }
        public int? CategoryId { get; set; }
        public int _start { get; set; }
        public int _end { get; set; }
    }
}