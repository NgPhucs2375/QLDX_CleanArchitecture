using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Repositories
{
    public class SagaInstanceRepository : ISagaInstanceRepository
    {
        private readonly SagaDbContext _sagaDbContext;

        public SagaInstanceRepository(SagaDbContext sagaDbContext)
        {
            _sagaDbContext = sagaDbContext;
        }

        public async Task<string?> GetCurrentStateByRequestIdAsync(int requestId)
        {
            return await _sagaDbContext.Set<PurchaseRequestSaga>()
                .Where(s => s.RequestId == requestId)
                .Select(s => s.CurrentState)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsByRequestIdAsync(int requestId)
        {
            return await _sagaDbContext.Set<PurchaseRequestSaga>()
                .AnyAsync(s => s.RequestId == requestId);
        }

        public async Task<Dictionary<int, string>> GetStatesByRequestIdsAsync(List<int> requestIds)
        {
            if (requestIds == null || requestIds.Count == 0)
                return new Dictionary<int, string>();

            return await _sagaDbContext.Set<PurchaseRequestSaga>()
                .Where(s => requestIds.Contains(s.RequestId))
                .Select(s => new { s.RequestId, s.CurrentState })
                .ToDictionaryAsync(s => s.RequestId, s => s.CurrentState);
        }

        public async Task<List<int>> GetActiveRequestIdsByStatesAsync(string[] activeStates)
        {
            return await _sagaDbContext.Set<PurchaseRequestSaga>()
                .Where(s => activeStates.Contains(s.CurrentState))
                .Select(s => s.RequestId)
                .ToListAsync();
        }
    }
}