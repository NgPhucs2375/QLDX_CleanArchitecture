using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public interface IApprovalRecordService
    {
        Task RecordAsync(PurchaseRequest entity, PurchaseRequestTrigger trigger, string note, CancellationToken ct);
    }
}
