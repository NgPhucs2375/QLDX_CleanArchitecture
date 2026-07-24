using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public interface IEventBusService
    {
        Task PublishAsync<T>(T message, CancellationToken ct = default) where T : class;
    }
}