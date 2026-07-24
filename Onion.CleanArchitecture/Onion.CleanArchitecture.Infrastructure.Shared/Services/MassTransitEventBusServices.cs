using System.Threading;
using System.Threading.Tasks;
using MassTransit;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Services
{
    public class MassTransitEventBusServices : IEventBusService
    {
        private readonly IPublishEndpoint _publishEndpoint;

        public MassTransitEventBusServices(IPublishEndpoint publishEndpoint)
        {
            _publishEndpoint = publishEndpoint;
        }

        public async Task PublishAsync<T>(T message, CancellationToken ct = default) where T : class =>
            await _publishEndpoint.Publish(message, ct);
    }
}