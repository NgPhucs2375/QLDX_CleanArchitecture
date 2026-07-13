using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.DeleteProposalConfigById
{
    public class DeleteProposalConfigByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeleteProposalConfigByIdCommandHandler : IRequestHandler<DeleteProposalConfigByIdCommand, Response<int>>
        {
            private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
            public DeleteProposalConfigByIdCommandHandler(IProposalConfigRepositoryAsync proposalConfigRepository)
            {
                _proposalConfigRepository = proposalConfigRepository;
            }
            public async Task<Response<int>> Handle(DeleteProposalConfigByIdCommand command, CancellationToken cancellationToken)
            {
                var proposalConfig = await _proposalConfigRepository.GetByIdAsync(command.Id);
                if (proposalConfig == null) throw new ApiException($"ProposalConfig Not Found.");
                await _proposalConfigRepository.DeleteAsync(proposalConfig);
                return new Response<int>(proposalConfig.Id);
            }
        }
    }
}
