using System;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Environments
{
    public interface ICloudinarySettingsProvider
    {
        string GetConnectionString();
    }
}
