using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetAllProposalConfigs;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces.Repositories
{
    public interface IProposalConfigRepositoryAsync : IGenericRepositoryAsync<ProposalConfig>
    {
        Task<bool> IsUniqueCodeAsync(string code);
        Task<PagedList<ProposalConfig>> GetPagedProposalConfigsAsync(GetAllProposalConfigsParameter parameter);
        Task<ProposalConfig> GetByIdWithDetailsAsync(int id);
    }
}
