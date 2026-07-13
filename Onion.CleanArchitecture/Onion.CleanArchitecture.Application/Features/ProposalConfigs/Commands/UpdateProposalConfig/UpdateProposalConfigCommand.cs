using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.UpdateProposalConfig
{
    public class UpdateProposalConfigCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime EffectiveDate { get; set; }
        public ConfigurationStatus Status { get; set; }

        public class UpdateProposalConfigCommandHandler : IRequestHandler<UpdateProposalConfigCommand, Response<int>>
        {
            private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
            public UpdateProposalConfigCommandHandler(IProposalConfigRepositoryAsync proposalConfigRepository)
            {
                _proposalConfigRepository = proposalConfigRepository;
            }
            public async Task<Response<int>> Handle(UpdateProposalConfigCommand command, CancellationToken cancellationToken)
            {
                var proposalConfig = await _proposalConfigRepository.GetByIdAsync(command.Id);
                if (proposalConfig == null)
                {
                    throw new ApiException($"ProposalConfig Not Found.");
                }
                else
                {
                    proposalConfig.Code = command.Code;
                    proposalConfig.Name = command.Name;
                    proposalConfig.EffectiveDate = command.EffectiveDate;
                    proposalConfig.Status = command.Status;
                    await _proposalConfigRepository.UpdateAsync(proposalConfig);
                    return new Response<int>(proposalConfig.Id);
                }
            }
        }
    }
}
