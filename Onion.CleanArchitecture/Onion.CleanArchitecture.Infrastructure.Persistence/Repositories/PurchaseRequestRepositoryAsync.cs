using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
using Onion.CleanArchitecture.Infrastructure.Persistence.Repository;
using Onion.CleanArchitecture.Infrastructure.Shared.Extensions;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Repositories
{
    public class PurchaseRequestRepositoryAsync : GenericRepositoryAsync<PurchaseRequest>, IPurchaseRequestRepositoryAsync
    {
        private readonly DbSet<PurchaseRequest> _entities;
        private readonly ApplicationDbContext _dbContext; // Bổ sung biến để truy vấn linh hoạt các Entity khác

        public PurchaseRequestRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
            _entities = dbContext.Set<PurchaseRequest>();
            _dbContext = dbContext; // Gán giá trị để sử dụng ở hàm dưới
        }

        public Task<bool> IsUniqueCodeAsync(string code)
        {
            return _entities
                .AllAsync(p => p.Code != code);
        }

        public async Task<PurchaseRequest> GetByIdWithDetailsAsync(int id)
        {
            return await _entities
                .Include(pr => pr.RequestCategories)
                    .ThenInclude(rc => rc.RequestItems)
                .Include(pr => pr.Approvers)
                .FirstOrDefaultAsync(pr => pr.Id == id);
        }

        public async Task<PagedList<PurchaseRequest>> GetPagedPurchaseRequestsAsync(GetAllPurchaseRequestsParameter request)
        {
            var query = _entities.AsQueryable();
            if (request._filter != null && request._filter.Count > 0)
            {
                query = MethodExtensions.ApplyFilters(query, request._filter);
            }

            return await PagedList<PurchaseRequest>.ToPagedList(
                query.OrderByDynamic(request._sort, request._order).AsNoTracking(),
                request._start,
                request._end);
        }

        // Bổ sung từ khóa 'async' để giải quyết lỗi CS4032
        public async Task<decimal> GetUsedAmountByCategoryAsync(int proposalConfigId, int departmentId, int categoryId, int? excludePurchaseRequestId = null)
        {
            // Các trạng thái được coi là đã/đang chiếm dụng hạn mức quota
            var activeStatuses = new[]
            {
                PurchaseRequestStatus.PendingDepartment,
                PurchaseRequestStatus.PendingControl,
                PurchaseRequestStatus.PendingOrderConfirm,
                PurchaseRequestStatus.Completed
            };

            // Truy vấn động trực tiếp từ bảng lưu chi tiết danh mục
            // Giải quyết lỗi CS1061 bằng cách gọi _dbContext.Set thay vì _entities.Select
            return await _dbContext.Set<PurchaseRequestCategory>()
                .Where(prc => prc.CategoryId == categoryId // Sửa lỗi CS0103: Lambda dùng '=>' thay vì '='
                    && prc.PurchaseRequest.ProposalConfigId == proposalConfigId
                    && prc.PurchaseRequest.DepartmentId == departmentId
                    && activeStatuses.Contains(prc.PurchaseRequest.Status) // Sửa lỗi CS0103: Sai chính tả tên biến
                    && (excludePurchaseRequestId == null || prc.PurchaseRequestId != excludePurchaseRequestId))
                .SumAsync(prc => prc.TotalProposedAmount);
        }
    }
}