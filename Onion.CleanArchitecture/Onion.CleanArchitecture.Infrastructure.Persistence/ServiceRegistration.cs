using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
using Onion.CleanArchitecture.Infrastructure.Persistence.Repositories;
using Onion.CleanArchitecture.Infrastructure.Persistence.Repository;
using Onion.CleanArchitecture.Infrastructure.Shared.Environments;
using System;


/// <summary>
/// DATA-Provider 
/// </summary>

namespace Onion.CleanArchitecture.Infrastructure.Persistence
{
    /// <summary>
    /// Goal : Đăng ký các dịch vụ liên quan đến cơ sở dữ liệu và kho lưu trữ (repositories) vào container DI (Dependency Injection).
    /// Mean : Khi ứng dụng khởi động, các dịch vụ này sẽ được tự động tạo và quản lý bởi DI container, giúp giảm sự phụ thuộc trực tiếp vào các lớp cụ thể và tăng tính linh hoạt của ứng dụng.
    /// Khi ứng dụng khởi động, các dịch vụ này sẽ được tự động tạo và quản lý bởi DI container, giúp giảm sự phụ thuộc trực tiếp vào các lớp cụ thể và tăng tính linh hoạt của ứng dụng.
        /// Đây là lớp tĩnh chứa các phương thức mở rộng (Extension Methods) để đăng ký các dịch vụ vào DI container.
        /// 
        /// 
        /// 
        /// Lấy connection string qua IDatabaseSettingsProvider :
        /// Thay vì đọc từ IConfiguration, code build 1 ServiceProvider tạm (sp.BuildServiceProvider()) 
        /// tạo scope,rồi resolve IDatabaseSettingsProvier để lấy connection string
        /// (GetSQLServerConnectionString(),GetPortgresConnectionString(),..) 
    /// </summary> 
    public static class ServiceRegistration
    {

        /// <summary>
        /// AddInMemoryDatabase : dùng cho testing/Dev nhanh , ko DB real
        /// </summary>
        public static void AddInMemoryDatabase(this IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("ApplicationDb"));
        }

        /// <summary>
        /// AddSqlServerPersistenceInfrastructure : dùng cho SQL Server
        /// </summary>

        public static void AddSqlServerPersistenceInfrastructure(this IServiceCollection services, string assembly)
        {
            var sp = services.BuildServiceProvider();
            using (var scope = sp.CreateScope())
            {
                var _dbSetting = scope.ServiceProvider.GetRequiredService<IDatabaseSettingsProvider>();
                string appConnStr = _dbSetting.GetBusinessConnectionString();
                services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                appConnStr,
                b => b.MigrationsAssembly(assembly)));
            }
        }

        //public static void AddMySqlPersistenceInfrastructure(this IServiceCollection services)
        //{
        //    // Build the intermediate service provider
        //    var sp = services.BuildServiceProvider();
        //    using (var scope = sp.CreateScope())
        //    {
        //        var _dbSetting = scope.ServiceProvider.GetRequiredService<IDatabaseSettingsProvider>();
        //        string appConnStr = _dbSetting.GetMySQLConnectionString();
        //        if (!string.IsNullOrWhiteSpace(appConnStr))
        //        {
        //            var serverVersion = new MySqlServerVersion(new Version(5, 7, 35));
        //            services.AddDbContext<ApplicationDbContext>(options =>
        //            options.UseMySql(
        //                appConnStr, serverVersion,
        //                b =>
        //                {
        //                    b.SchemaBehavior(MySqlSchemaBehavior.Ignore);
        //                    b.EnableRetryOnFailure(
        //                        maxRetryCount: 5,
        //                        maxRetryDelay: TimeSpan.FromSeconds(30),
        //                        errorNumbersToAdd: null);
        //                    b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
        //                    b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        //                }));
        //        }
        //    }
        //}


        /// <summary>
        /// AddNpgSqlPersistenceInfrastructure : dùng cho PostgreSQL
        /// </summary>
        public static void AddNpgSqlPersistenceInfrastructure(this IServiceCollection services)
        {
            // Build the intermediate service provider
            var sp = services.BuildServiceProvider();
            using (var scope = sp.CreateScope())
            {
                var _dbSetting = scope.ServiceProvider.GetRequiredService<IDatabaseSettingsProvider>();
                string appConnStr = _dbSetting.GetPostgresConnectionString(); 
                if (!string.IsNullOrWhiteSpace(appConnStr))
                {
                    services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseNpgsql(
                    appConnStr,
                    b =>
                    {
                        b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                        b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    }));
                }
            }
        }

        public static void AddNpgSqlSagaDbContext(this IServiceCollection services)
        {
            var sp = services.BuildServiceProvider();
            using (var scope = sp.CreateScope())
            {
                var _dbSetting = scope.ServiceProvider.GetRequiredService<IDatabaseSettingsProvider>();
                string appConnStr = _dbSetting.GetPostgresConnectionString();
                if (!string.IsNullOrWhiteSpace(appConnStr))
                {
                    services.AddDbContext<SagaDbContext>(options =>
                    options.UseNpgsql(appConnStr));
                }
            }
        }

        /// <summary>
        /// AddPersistenceReposotories : Đăng ký Repository Pattern
        /// Generic repository (IGenericRepositoryAsync<T>) cho các thao tác CRUD
        /// Repository cụ thể (IProductRepositoryAsync) cho các thao tác đặc thù của từng entity
        /// </summary>
        public static void AddPersistenceRepositories(this IServiceCollection services)
        {
            #region Repositories
            services.AddTransient(typeof(IGenericRepositoryAsync<>), typeof(GenericRepositoryAsync<>));
            services.AddTransient<IProductRepositoryAsync, ProductRepositoryAsync>();
            services.AddTransient<ICategoryRepositoryAsync, CategoryRepositoryAsync>();
            services.AddTransient<IDepartmentRepositoryAsync, DepartmentRepositoryAsync>();
            services.AddTransient<IProposalConfigRepositoryAsync, ProposalConfigRepositoryAsync>();
            services.AddTransient<IConfigCategoryRepositoryAsync, ConfigCategoryRepositoryAsync>();
            services.AddTransient<IConfigApproverRepositoryAsync, ConfigApproverRepositoryAsync>();
            services.AddTransient<IPurchaseRequestRepositoryAsync, PurchaseRequestRepositoryAsync>();
            services.AddTransient<IPurchaseRequestCategoryRepositoryAsync, PurchaseRequestCategoryRepositoryAsync>();
            services.AddTransient<IPurchaseRequestItemRepositoryAsync, PurchaseRequestItemRepositoryAsync>();
            services.AddTransient<IPurchaseRequestApprovalRepositoryAsync, PurchaseRequestApprovalRepositoryAsync>();
            services.AddTransient<IPurchaseRequestApproverRepositoryAsync, PurchaseRequestApproverRepositoryAsync>();
            #endregion
        }
    }
}
