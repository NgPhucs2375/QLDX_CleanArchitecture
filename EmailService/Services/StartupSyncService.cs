using MassTransit;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;

namespace Onion.CleanArchitecture.EmailService.Services
{
    public class StartupSyncService : IHostedService
    {
        private readonly IBus _bus;
        private readonly ILogger<StartupSyncService> _logger;

        public StartupSyncService(IBus bus, ILogger<StartupSyncService> logger)
        {
            _bus = bus;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var maxRetries = 10;
            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    await _bus.Publish(new RequestSyncEvent(
                        RequesterId: "EmailService",
                        RequestedAt: DateTime.UtcNow
                    ), cancellationToken);
                    _logger.LogInformation("Published RequestSyncEvent to sync users");
                    return;
                }
                catch (Exception ex) when (i < maxRetries - 1)
                {
                    _logger.LogWarning("Bus not ready, retry {Attempt}/{Max}: {Message}", i + 1, maxRetries, ex.Message);
                    await Task.Delay(3000, cancellationToken);
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
