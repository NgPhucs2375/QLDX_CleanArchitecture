using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.UpdateProposalConfig
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
    }

    public class UpdateProposalConfigCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime EffectiveDate { get; set; }
        public ConfigurationStatus Status { get; set; }

        public List<ConfigCategoryDto> Categories { get; set; } = new();
        public List<ConfigApproverDto> Approves { get; set; } = new();

        public class UpdateProposalConfigCommandHandler : IRequestHandler<UpdateProposalConfigCommand, Response<int>>
        {
            private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
            public UpdateProposalConfigCommandHandler(IProposalConfigRepositoryAsync proposalConfigRepository)
            {
                _proposalConfigRepository = proposalConfigRepository;
            }
            public async Task<Response<int>> Handle(UpdateProposalConfigCommand command, CancellationToken cancellationToken)
            {
                var proposalConfig = await _proposalConfigRepository.GetByIdWithDetailsAsync(command.Id);
                if (proposalConfig == null)
                {
                    throw new ApiException($"ProposalConfig Not Found.");
                }

                proposalConfig.Code = command.Code;
                proposalConfig.Name = command.Name;
                proposalConfig.EffectiveDate = command.EffectiveDate;
                proposalConfig.Status = command.Status;

                proposalConfig.ConfigCategories.Clear();
                foreach (var cat in command.Categories)
                {
                    proposalConfig.ConfigCategories.Add(new ConfigCategory
                    {
                        CategoryId = cat.CategoryId,
                        DepartmentId = cat.DepartmentId,
                        AllowedQuota = cat.AllowedQuota,
                    });
                }

                proposalConfig.ConfigApprovers.Clear();
                foreach (var appr in command.Approves)
                {
                    if (!Guid.TryParse(appr.ApproverId, out _))
                        throw new ApiException($"ApproverId '{appr.ApproverId}' không hợp lệ. Phải là GUID của người dùng.");

                    proposalConfig.ConfigApprovers.Add(new ConfigApprover
                    {
                        DepartmentId = appr.DepartmentId,
                        ApproverId = appr.ApproverId,
                        Level = ApprovalLevel.ControlLevel,
                    });
                }

                await _proposalConfigRepository.UpdateAsync(proposalConfig);
                return new Response<int>(proposalConfig.Id);
            }
        }
    }
}
