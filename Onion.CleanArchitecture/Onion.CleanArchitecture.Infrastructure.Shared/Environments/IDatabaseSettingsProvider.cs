namespace Onion.CleanArchitecture.Infrastructure.Shared.Environments
{
    public interface IDatabaseSettingsProvider
    {
        string GetPostgresConnectionString();
        // string GetMySQLConnectionString();
        // string GetSQLServerConnectionString();
                // Lấy chuỗi kết nối cho DB Bảo mật
        string GetIdentityConnectionString(); 
        
        // Lấy chuỗi kết nối cho DB Nghiệp vụ
        string GetBusinessConnectionString(); 
    }
}
