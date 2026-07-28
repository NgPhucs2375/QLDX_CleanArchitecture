namespace Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport
{
    public class DepartmentStatusDto
    {
        public string DepartmentName { get; set; }       // Tên phòng ban
        public int Status { get; set; }                  // Mã trạng thái
        public string StatusName { get; set; }           // Tên trạng thái
        public int Count { get; set; }                   // Số lượng phiếu
    }
}