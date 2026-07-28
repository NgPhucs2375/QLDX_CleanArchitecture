namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class KpiSummaryDto
    {
        public int TotalRequests { get; set; }          // Tổng số phiếu
        public decimal TotalProposedAmount { get; set; } // Tổng giá trị đề xuất
        public int PendingApprovals { get; set; }       // Đang chờ duyệt (Status 2 + 3)
        public int CompletedRequests { get; set; }       // Hoàn thành (Status 6)
    }
}