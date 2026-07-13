using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Contexts
{
    public class IdentityContextFactory : IDesignTimeDbContextFactory<IdentityContext>
    {
        public IdentityContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<IdentityContext>();

            // Chuỗi kết nối trực tiếp dành riêng cho lúc gõ lệnh Migration tạo DB Identity
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=QLDX_Identity_Db;Username=postgres;Password=2375");

            return new IdentityContext(optionsBuilder.Options);
        }
    }
}