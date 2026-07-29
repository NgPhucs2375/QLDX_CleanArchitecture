using System.Collections.Generic;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public interface ISagaInstanceRepository
    {
        Task<string?> GetCurrentStateByRequestIdAsync(int requestId);
        Task<bool> ExistsByRequestIdAsync(int requestId);
        Task<Dictionary<int, string>> GetStatesByRequestIdsAsync(List<int> requestIds);
        Task<List<int>> GetActiveRequestIdsByStatesAsync(string[] activeStates);
    }
}