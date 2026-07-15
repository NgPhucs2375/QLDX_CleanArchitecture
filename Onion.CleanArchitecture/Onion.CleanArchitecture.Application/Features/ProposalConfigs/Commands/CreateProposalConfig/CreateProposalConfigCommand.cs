using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.CreateProposalConfig
{
    public class ConfigCategoryDto
    {
        public int CategoryId { get; set; }
        public int DepartmentId { get; set; }
        public decimal AllowedQuota { get; set; }
    }

    public class ConfigApproverDto
    {
        public int DepartmentId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public ApprovalLevel Level { get; set; }
    }

    public class CreateProposalConfigCommand : IRequest<Response<int>>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public ConfigurationStatus Status { get; set; } = ConfigurationStatus.Draft;

        public List<ConfigCategoryDto> Categories { get; set; } = new();
        public List<ConfigApproverDto> Approvers { get; set; } = new();
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
            proposalConfig.Status = request.Status;

            foreach (var cat in request.Categories)
            {
                proposalConfig.ConfigCategories.Add(new ConfigCategory
                {
                    CategoryId = cat.CategoryId,
                    DepartmentId = cat.DepartmentId,
                    AllowedQuota = cat.AllowedQuota,
                    UsedAmount = 0,
                    RemainingAmount = cat.AllowedQuota,
                });
            }

            foreach (var appr in request.Approvers)
            {
                proposalConfig.ConfigApprovers.Add(new ConfigApprover
                {
                    DepartmentId = appr.DepartmentId,
                    ApproverId = appr.ApproverId,
                    Level = appr.Level,
                });
            }

            await _proposalConfigRepository.AddAsync(proposalConfig);
            return new Response<int>(proposalConfig.Id);
        }
    }
}