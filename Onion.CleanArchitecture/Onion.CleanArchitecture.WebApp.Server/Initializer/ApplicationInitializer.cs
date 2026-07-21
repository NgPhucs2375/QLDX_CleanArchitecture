using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Infrastructure.Identity.Contexts;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using Onion.CleanArchitecture.Infrastructure.Identity.Services;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
using Serilog;
using System.Linq;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Casbin;

namespace Onion.CleanArchitecture.WebApp.Server.Initializer
{
    public class ApplicationInitializer
    {
        private readonly IServiceProvider _serviceProvider;

        public ApplicationInitializer(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task InitializeAsync()
        {
            //Read Configuration from appSettings
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build();
            //Initialize Logger
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(config)
                .CreateLogger();
            try
            {
                var dbContext = _serviceProvider.GetRequiredService<ApplicationDbContext>();
                if (dbContext.Database.GetPendingMigrations().Any())
                    dbContext.Database.Migrate();

                var identityDbContext = _serviceProvider.GetRequiredService<IdentityContext>();
                if (identityDbContext.Database.GetPendingMigrations().Any())
                    identityDbContext.Database.Migrate();

                var userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var roleManager = _serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                await Infrastructure.Identity.Seeds.DefaultRoles.SeedAsync(userManager, roleManager);
                await Infrastructure.Identity.Seeds.DefaultSuperAdmin.SeedAsync(userManager, roleManager);
                await Infrastructure.Identity.Seeds.DefaultBasicUser.SeedAsync(userManager, roleManager);
                await Infrastructure.Identity.Seeds.DefaultBasic.SeedAsync(userManager, roleManager);

                // ================= BẮT ĐẦU ĐOẠN ĐÃ CHỈNH SỬA =================
                var enforcer = _serviceProvider.GetRequiredService<Casbin.Enforcer>();
                var existingPolicies = enforcer.GetPolicy();

                if (existingPolicies == null || !existingPolicies.Any())
                {
                    var permissionSync = _serviceProvider.GetRequiredService<PermissionSyncService>();
                    await permissionSync.SyncAsync();
                    Log.Information("Đã đồng bộ quyền từ Database sang Policy lần đầu tiên.");
                }
                else
                {
                    Log.Information("Policy đã có dữ liệu, bỏ qua bước đồng bộ từ Database.");
                }
                // ================= KẾT THÚC ĐOẠN ĐÃ CHỈNH SỬA =================

                Log.Information("Finished Seeding Default Data");
                Log.Information("Application Starting");
            }
            catch (Exception ex)
            {
                Log.Warning(ex, "An error occurred seeding the DB");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }
}