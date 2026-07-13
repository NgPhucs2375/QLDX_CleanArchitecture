using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IPurchaseRequestLogRepositoryAsync : IGenericRepositoryAsync<PurchaseRequestLog>
    {
        Task<PagedList<PurchaseRequestLog>> GetPagedPurchaseRequestLogsAsync(GetAllPurchaseRequestLogsParameter parameter);
    }
}
