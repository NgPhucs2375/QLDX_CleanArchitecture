namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class TrendDataDto
    {
        public string Period { get; set; }              // "2026-01", "2026-02",...
        public int RequestCount { get; set; }            // Số phiếu trong tháng
        public decimal TotalAmount { get; set; }         // Tổng tiền trong tháng
    }
}