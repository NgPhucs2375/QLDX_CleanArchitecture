// using System.Collections.Generic;
// using System.Data;
// using System.Threading.Tasks;
// using Dapper;
// using Microsoft.EntityFrameworkCore;
// using Onion.CleanArchitecture.Application.Features.Report.PurchaseRequestReport.Queries.GetPurchaseRequestReport;
// using Onion.CleanArchitecture.Application.Interfaces.Repositories;
// using Onion.CleanArchitecture.Application.Wrappers;
// using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;

// namespace Onion.CleanArchitecture.Infrastructure.Persistence.Repositories
// {
//     public class PurchaseRequestReportRepositoryAsync : IPurchaseRequestReportRepositoryAsync
//     {
//         private readonly ApplicationDbContext _context;
//         private readonly IDbConnection _connection;

//         public PurchaseRequestReportRepositoryAsync(
//             ApplicationDbContext context,
//             IDbConnection connection
//         )
//         {
//             _context = context;
//             _connection = connection;
//         }

//         /// <summary>
//         /// Hàm lấy dữ liệu phân phối danh mục từ cơ sở dữ liệu dựa trên các tham số lọc được cung cấp.
//         /// Lấy : Tên danh mục
//         ///       Tính tổng cột TotalProposedAmount COALESCE use to nếu tổng null thì return 0
//         /// Từ  : Bảng Phiếu đề xuất
//         /// Với Điều Kiện : Nếu tham số FromDate là null hoặc Create thì lớn hơn hoặc bằng FromDate
//         ///                 Nếu tham số ToDate là null hoặc Create thì nhỏ hơn hoặc bằng ToDate
//         ///                 Nếu tham số DepartmentId là null hoặc DepartmentId thì bằng DepartmentId
//         ///                 Nếu tham số Status là null hoặc Status thì bằng Status
//         ///                 Gom nhóm các bản ghi theo danh mục
//         ///                 Sắp xếp kết quả trả về theo tổng số tiền giảm dần
//         /// </summary>
//         /// <param name="filter"></param>
//         /// <returns> Trả về danh sách dữ liệu phân phối danh mục</returns>
//         public async Task<List<CategoryDistributionDto>> GetCategoryDistributionAsync(GetPurchaseRequestReportParameter filter)
//         {
//                         var sql = @"
//                 SELECT
//                     c.""Name"" AS CategoryName,
//                     COALESCE(SUM(prc.""TotalProposedAmount""), 0) AS TotalAmount
//                 FROM ""PurchaseRequestCategories"" prc
//                 JOIN ""Categories"" c ON prc.""CategoryId"" = c.""Id""
//                 JOIN ""PurchaseRequests"" pr ON prc.""PurchaseRequestId"" = pr.""Id""
//                 WHERE (@FromDate IS NULL OR pr.""Created"" >= @FromDate)
//                 AND (@ToDate IS NULL OR pr.""Created"" <= @ToDate)
//                 AND (@DepartmentId IS NULL OR pr.""DepartmentId"" = @DepartmentId)
//                 AND (@Status IS NULL OR pr.""Status"" = @Status)
//                 AND (@CategoryId IS NULL OR prc.""CategoryId"" = @CategoryId)
//                 GROUP BY c.""Name""
//                 ORDER BY TotalAmount DESC
//             ";
//             return await _connection.QueryFirstOrDefaultAsync<List<CategoryDistributionDto>>(sql, filter);

//         }

//         /// <summary>
//         /// Hàm lấy dữ liệu trạng thái phòng ban từ cơ sở dữ liệu dựa trên các tham số lọc được cung cấp.
//         /// Lấy : Tên phòng ban
//         ///       Trạng thái phiếu đề xuất
//         ///       Đếm số lượng phiếu đề xuất theo trạng thái
//         /// Từ  : Bảng Phiếu đề xuất
//         /// Với Điều Kiện : Nếu tham số FromDate là null hoặc Create thì lớn hơn hoặc bằng FromDate
//         ///                 Nếu tham số ToDate là null hoặc Create thì nhỏ hơn hoặc bằng ToDate
//         ///                 Nếu tham số DepartmentId là null hoặc DepartmentId thì bằng DepartmentId
//         ///                 Nếu tham số Status là null hoặc Status thì bằng Status
//         ///                 Gom nhóm các bản ghi theo phòng ban và trạng thái phiếu đề xuất
//         ///                 Sắp xếp kết quả trả về theo tên phòng ban và trạng thái phiếu đề xuất
//         /// </summary>
//         /// <param name="filter"></param>
//         /// <returns>Trả về danh sách dữ liệu trạng thái phòng ban</returns>
//         public async Task<List<DepartmentStatusDto>> GetDepartmentStatusAsync(GetPurchaseRequestReportParameter filter)
//         {
//             var sql=@"
//                 SELECT
//                     d.""Name"" AS DepartmentName,
//                     pr.""Status""::int,
//                     COUNT(*)::int AS Count
//                 FROM ""PurchaseRequests"" pr
//                 JOIN ""Departments"" d ON pr.""DepartmentId"" = d.""Id""
//                 WHERE (@FromDate IS NULL OR pr.""Created"" >= @FromDate)
//                 AND (@ToDate IS NULL OR pr.""Created"" <= @ToDate)
//                 AND (@DepartmentId IS NULL OR pr.""DepartmentId"" = @DepartmentId)
//                 AND (@Status IS NULL OR pr.""Status"" = @Status)
//                 GROUP BY d.""Name"", pr.""Status""
//                 ORDER BY d.""Name"", pr.""Status""
//             ";
//             return await _connection.QueryFirstOrDefaultAsync<List<DepartmentStatusDto>>(sql, filter);
//             }

//         /// <summary>
//         /// Hàm lấy dữ liệu KPI tổng hợp từ cơ sở dữ liệu dựa trên các tham số lọc được cung cấp.
//         /// Lấy : Đếm all các yêu cầu
//         ///       Tính tổng cột TotalProposedAmount COALESCE use to nếu tổng null thì return 0
//         ///       Đếm all Các phiếu có Status =2|3 (Pending Approvals)
//         ///       Đếm all Các phiếu có Status =6 (Completed Requests)
//         /// Từ  : Bảng Phiếu đề xuất
//         /// Với Điều Kiện : Nếu tham số FromDate là null hoặc Create thì lớn hơn hoặc bằng FromDate
//         ///                 Nếu tham số ToDate là null hoặc Create thì nhỏ hơn hoặc bằng ToDate
//         ///                 Nếu tham số DepartmentId là null hoặc DepartmentId thì bằng DepartmentId
//         ///                 Nếu tham số Status là null hoặc Status thì bằng Status
//         /// </summary>
//         /// <param name="filter"></param>
//         /// <returns> trả về 1 đối tượng IDbConnection đại diện cho kết nối đến csdl
//         ///</returns>
//         public async Task<KpiSummaryDto> GetKpiSummaryAsync(GetPurchaseRequestReportParameter filter)
//         {
//             var sql = @"
//             SELECT
//                 COUNT(*)::int AS TotalRequests,
//                 COALESCE(SUM(""TotalProposedAmount""), 0) AS TotalProposedAmount,
//                 COUNT(*) FILTER (WHERE ""Status"" IN (2, 3))::int AS PendingApprovals,
//                 COUNT(*) FILTER (WHERE ""Status"" = 6)::int AS CompletedRequests
//             FROM ""PurchaseRequests""
//             WHERE (@FromDate IS NULL OR ""Created"" >= @FromDate)
//               AND (@ToDate IS NULL OR ""Created"" <= @ToDate)
//               AND (@DepartmentId IS NULL OR ""DepartmentId"" = @DepartmentId)
//               AND (@Status IS NULL OR ""Status"" = @Status)";

//             return await _connection.QueryFirstOrDefaultAsync<KpiSummaryDto>(sql, filter);
//         }

//         /// <summary>
//         /// Hàm lấy dữ liệu chi tiết phiếu đề xuất từ cơ sở dữ liệu dựa trên các tham số lọc được cung cấp.
//         /// Lấy : Id, Code, Tên phòng ban, Người tạo, Ngày tạo, Trạng thái phiếu đề xuất, Tổng số tiền đề xuất
//         /// Từ  : Bảng Phiếu đề xuất
//         /// Với Điều Kiện : Nếu tham số FromDate là null hoặc Create thì lớn hơn hoặc bằng FromDate
//         ///                 Nếu tham số ToDate là null hoặc Create thì nhỏ hơn hoặc bằng ToDate
//         ///                 Nếu tham số DepartmentId là null hoặc DepartmentId thì bằng DepartmentId
//         ///                 Nếu tham số Status là null hoặc Status thì bằng Status
//         ///                 Nếu tham số CategoryId là null hoặc CategoryId thì tồn tại trong bảng PurchaseRequestCategories với CategoryId tương ứng
//         ///                 Sắp xếp kết quả trả về theo ngày tạo giảm dần
//         /// </summary>
//         /// <param name="filter"></param>
//         /// <returns>Trả về danh sách dữ liệu chi tiết phiếu đề xuất</returns>
//         public async Task<PagedList<RequestDetailDto>> GetRequestDetailsAsync(GetPurchaseRequestReportParameter filter)
//         {
//              var query = _context.PurchaseRequests
//                 .Include(pr => pr.Department) // Include Department to access its Name property
//                 .AsNoTracking() // Use AsNoTracking for better performance on read-only queries
//                 .Where(pr =>
//                     (!filter.FromDate.HasValue || pr.Created >= filter.FromDate.Value) &&
//                     (!filter.ToDate.HasValue || pr.Created <= filter.ToDate.Value) &&
//                     (!filter.DepartmentId.HasValue || pr.DepartmentId == filter.DepartmentId.Value) &&
//                     (!filter.Status.HasValue || pr.Status == filter.Status.Value) &&
//                     // This condition translates to an EXISTS subquery in SQL, which is efficient
//                     (!filter.CategoryId.HasValue || _context.PurchaseRequestCategories.Any(prc => prc.PurchaseRequestId == pr.Id && prc.CategoryId == filter.CategoryId.Value))
//                 )
//                 .Select(pr => new RequestDetailDto
//                 {
//                     Id = pr.Id,
//                     Code = pr.Code,
//                     DepartmentName = pr.Department.Name,
//                     CreatedBy = pr.CreatedBy,
//                     Created = pr.Created,
//                     Status = (int)pr.Status,
//                     StatusName = pr.Status.ToString(), // Automatically maps the enum value to its string name
//                     TotalProposedAmount = pr.TotalProposedAmount
//                 });

//         }

//         ///<summary>
//         /// Hàm lấy dữ liệu xu hướng từ cơ sở dữ liệu dựa trên các tham số lọc được cung cấp.
//         /// Lấy : Ngày tháng
//         ///       Đếm all phiếu đề xuất ::int(Ép kiểu kết quả PortgreSQL)
//         ///       Tính tổng cột TotalProposedAmount COALESCE use to nếu tổng null thì return 0
//         /// Từ  : Bảng Phiếu đề xuất
//         /// Điều kiện : Nếu FromDate null hoặc created thì lớn hơn hoặc bằng FromDate
//         ///             Và Nếu ToDate null hoặc created thì nhỏ hơn hoặc bằng ToDate
//         ///             Và Nếu DepartmentId null hoặc DepartmentId thì bằng DepartmentId
//         ///             Và Nếu Status null hoặc Status thì bằng Status
//         ///             Gom nhóm Các bản ghi theo tháng năm
//         ///             Sắp xếp kết quả trả về theo thứ tự thời gian tăng dần
//         /// </summary>
//         /// <param name="filter"></param>
//         /// <returns> trả về 1 đối tượng IDbConnection đại diện cho kết nối
//         public async Task<List<TrendDataDto>> GetTrendDataAsync(GetPurchaseRequestReportParameter filter)
//         {
//             //TO_CHAR("CREATED","YYYY-MM") chuyển đổi giá trị của cột "Created" thành một chuỗi có định dạng Năm - Tháng
//             var sql = @"
//             SELECT
//                 TO_CHAR(""Created"", 'YYYY-MM') AS Period,
//                 COUNT(*)::int AS RequestCount,
//                 COALESCE(SUM(""TotalProposedAmount""), 0) AS TotalAmount
//             FROM ""PurchaseRequests""
//             WHERE (@FromDate IS NULL OR ""Created"" >= @FromDate)
//             AND (@ToDate IS NULL OR ""Created"" <= @ToDate)
//             AND (@DepartmentId IS NULL OR ""DepartmentId"" = @DepartmentId)
//             AND (@Status IS NULL OR ""Status"" = @Status)
//             GROUP BY TO_CHAR(""Created"", 'YYYY-MM')
//             ORDER BY Period";

//         return await _connection.QueryFirstOrDefaultAsync<List<TrendDataDto>>(sql, filter);
//         }
//     }
// }