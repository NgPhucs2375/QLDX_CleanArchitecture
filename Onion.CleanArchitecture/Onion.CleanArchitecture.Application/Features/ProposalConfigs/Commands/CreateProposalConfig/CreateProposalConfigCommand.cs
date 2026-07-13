using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.CreateProposalConfig
{
    public class CreateProposalConfigCommand : IRequest<Response<int>>
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime EffectiveDate { get; set; }
        public ConfigurationStatus Status { get; set; } = ConfigurationStatus.Draft;
    }
    public class CreateProposalConfigCommandHandler : IRequestHandler<CreateProposalConfigCommand, Response<int>>
    {
        private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
        private readonly IMapper _mapper;
        public CreateProposalConfigCommandHandler(IProposalConfigRepositoryAsync proposalConfigRepository, IMapper mapper)
        {
            _proposalConfigRepository = proposalConfigRepository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreateProposalConfigCommand request, CancellationToken cancellationToken)
        {
            var proposalConfig = _mapper.Map<ProposalConfig>(request);
            await _proposalConfigRepository.AddAsync(proposalConfig);
            return new Response<int>(proposalConfig.Id);
        }
    }
}
