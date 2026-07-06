using StackExchange.Redis.Extensions.Core.Configuration;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Environments
{
    public interface IRedisSettingsProvider
    {
        RedisConfiguration GetRedisConfiguration();
    }
}
