namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class CategoryDistributionDto
    {
        public string CategoryName { get; set; }         // Tên danh mục
        public decimal TotalAmount { get; set; }          // Tổng tiền
        public decimal Percentage { get; set; }           // % (tính ở backend)
    }

}