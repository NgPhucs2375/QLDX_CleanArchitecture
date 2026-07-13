using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Environments
{
    public class DatabaseSettingsProvider : IDatabaseSettingsProvider
    {
        private readonly IHostEnvironment _env;
        private readonly IConfiguration _config;
        public DatabaseSettingsProvider(
            IHostEnvironment env,
            IConfiguration config
            )
        {
            _env = env;
            _config = config;
        }
        // public string GetMySQLConnectionString()
        // {
            
        //     var isHasMySQLConnectionString = EnvironmentVariables.HasMySQLConnectionString();
        //     if (_env.IsProduction() && isHasMySQLConnectionString)
        //     {
        //         return Environment.GetEnvironmentVariable(EnvironmentVariables.MySQLConnectionString);
        //     }
        //     return _config.GetConnectionString("MySQLConnection");
        // }

        public string GetPostgresConnectionString()
        {
            var isHasPostgresConnectionString = EnvironmentVariables.HasPostgresConnectionString();
            if (_env.IsProduction() && isHasPostgresConnectionString)
            {
                return Environment.GetEnvironmentVariable(EnvironmentVariables.PostgresConnectionString);
            }
            return _config.GetConnectionString("PostgresConnectionString");
        }

        // public string GetSQLServerConnectionString()
        // {
        //     var isHasSQLServerConnectionString = EnvironmentVariables.HasSQLServerConnectionString();
        //     if (_env.IsProduction() && isHasSQLServerConnectionString)
        //     {
        //         return Environment.GetEnvironmentVariable(EnvironmentVariables.SQLServerConnectionString);
        //     }
        //     return _config.GetConnectionString("SQLServerConnection");
        // }


        public string GetIdentityConnectionString()
        {
            return _config.GetConnectionString("IdentityConnection");
        }

        // 2. Hàm lấy chuỗi kết nối cho DB Nghiệp vụ
        public string GetBusinessConnectionString()
        {
            return _config.GetConnectionString("BusinessConnection");
        }

    }
}
