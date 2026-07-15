using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.CreateConfigApprover
{
    public class CreateConfigApproverCommand : IRequest<Response<int>>
    {
        public int ProposalConfigId { get; set; }
        public int DepartmentId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public ApprovalLevel Level { get; set; }
    }
    public class CreateConfigApproverCommandHandler : IRequestHandler<CreateConfigApproverCommand, Response<int>>
    {
        private readonly IConfigApproverRepositoryAsync _configApproverRepository;
        private readonly IMapper _mapper;
        public CreateConfigApproverCommandHandler(IConfigApproverRepositoryAsync configApproverRepository, IMapper mapper)
        {
            _configApproverRepository = configApproverRepository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreateConfigApproverCommand request, CancellationToken cancellationToken)
        {
            var configApprover = _mapper.Map<ConfigApprover>(request);
            await _configApproverRepository.AddAsync(configApprover);
            return new Response<int>(configApprover.Id);
        }
    }
}
