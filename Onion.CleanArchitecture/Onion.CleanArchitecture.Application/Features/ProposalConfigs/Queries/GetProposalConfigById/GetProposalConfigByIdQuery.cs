using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetProposalConfigById
{
    public class GetProposalConfigByIdQuery : IRequest<Response<ProposalConfig>>
    {
        public int Id { get; set; }
        public class GetProposalConfigByIdQueryHandler : IRequestHandler<GetProposalConfigByIdQuery, Response<ProposalConfig>>
        {
            private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
            public GetProposalConfigByIdQueryHandler(IProposalConfigRepositoryAsync proposalConfigRepository)
            {
                _proposalConfigRepository = proposalConfigRepository;
            }
            public async Task<Response<ProposalConfig>> Handle(GetProposalConfigByIdQuery query, CancellationToken cancellationToken)
            {
                var proposalConfig = await _proposalConfigRepository.GetByIdAsync(query.Id);
                if (proposalConfig == null) throw new ApiException($"ProposalConfig Not Found.");
                return new Response<ProposalConfig>(proposalConfig);
            }
        }
    }
}
