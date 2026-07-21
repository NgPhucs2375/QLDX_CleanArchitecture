using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Contexts
{
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        ///  DI(Dependency Injection) qua Constructor
        ///  Goal: tách biệt (decouple) việc get time và get info ra khỏi DB
        ///  Mean: thay vì dùng DateTime.Now(gây khó khăn khi viết Test) or try to read Cookie/Token trực tiếp trong DbContext
        /// nó nhờ 2 Interface cung cấp dữ liệu. làm DbContext "Clean"
        /// </summary>
        private readonly IDateTimeService _dateTime;
        // _authenticatedUser : lấy chính xác ID cuae user call API để "luu vết"
        private readonly IAuthenticatedUserService _authenticatedUser;


        /// <summary>
        /// ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
        /// Goal : Tối ưu hiệu năng , tăng tốc độ đọc dữ liệu lên mức optimistic
        /// Mean : support nhiều user đồng thời(Staycation).Tìm kiếm và lọc dữ liệu nhanh
        /// Default : EF Core track mọi dữ liệu nó kéo từ SQL lên xem ai có change gì không(tốn RAM)
        /// dòng này tắt nó đi khi nào wanna update/delete ,mới bận Tracking lên
        /// </summary>

        /// Contructor 
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IDateTimeService dateTime, IAuthenticatedUserService authenticatedUser) : base(options)
        {
            ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            _dateTime = dateTime;
            _authenticatedUser = authenticatedUser;
        }

        /// <summary>
        ///   Các bảng dữ liệu (DbSet) trong cơ sở dữ liệu được ánh xạ từ các thực thể (Entity) trong ứng dụng.
        ///   Mỗi DbSet đại diện cho một bảng trong cơ sở dữ liệu và cho
        /// </summary>
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<ProposalConfig> ProposalConfigs { get; set; }
        public DbSet<ConfigCategory> ConfigCategories { get; set; }
        public DbSet<ConfigApprover> ConfigApprovers { get; set; }
        public DbSet<PurchaseRequest> PurchaseRequests { get; set; }
        public DbSet<PurchaseRequestCategory> PurchaseRequestCategories { get; set; }
        public DbSet<PurchaseRequestItem> PurchaseRequestItems { get; set; }
        public DbSet<PurchaseRequestApproval> PurchaseRequestApprovals { get; set; }
        public DbSet<PurchaseRequestApprover> PurchaseRequestApprovers { get; set; }




        /// <summary>
        /// CÁC HÀM OVERRIDE
        /// SaveChangesAsync : override để tự động cập nhật các trường Created, CreatedBy, LastModified, LastModifiedBy khi thêm hoặc sửa đổi các thực thể kế thừa từ AuditableBaseEntity.
        /// Goal : Auto fill các field Created, CreatedBy, LastModified, LastModifiedBy khi thao tác dữ liệu
        /// Mean : Audit: Lưu đầy đủ lịch sử thay đổi dữ liệu
        ///      : Trước khi save dl xuống DB(base.SaveChangseAsync), quét all các Entity bị tác động Nếu Entity đó kế thừa 
        /// từ AuditableBaseEntity nó sẽ check:
        ///      If Add (EntityState.Added): auto gán Created và CreatBy
        ///      If Update (EntityState.Modified): auto gán LastModified và LastModifiedBy
        /// </summary>


        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<AuditableBaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.Created = _dateTime.NowUtc;
                        entry.Entity.CreatedBy = _authenticatedUser.UserId;
                        break;
                    case EntityState.Modified:
                        entry.Entity.LastModified = _dateTime.NowUtc;
                        entry.Entity.LastModifiedBy = _authenticatedUser.UserId;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }


        /// <summary>
        /// Override OnModelCreating:  để cấu hình các thực thể và mối quan hệ giữa chúng trong cơ sở dữ liệu.
        /// Goal : Địng dang kiểu dữ liệu cho all các column lq tiền tệ / số thập phân
        /// Mean : hệ thống có rất nhiều field tính tiền, thay vì phải decimal cho từng bảng , template dùng
        /// Reflection quét all các property ,thấy kiểu decimal là nps ép decimal(18,6)  hoặc (18,2) nếu dùng ở VN
        /// </summary>
        protected override void OnModelCreating(ModelBuilder builder)
        {
            //All Decimals will have 18,6 Range
            foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            //decimal? : là nullable decimal, có thể chứa giá trị null. Nó được sử dụng khi bạn muốn cho phép một trường decimal trong cơ sở dữ liệu có thể không có giá trị (null) thay vì luôn phải có một giá trị số.
            {
                property.SetColumnType("decimal(18,6)");
            }
            base.OnModelCreating(builder);
        }
    }
}
