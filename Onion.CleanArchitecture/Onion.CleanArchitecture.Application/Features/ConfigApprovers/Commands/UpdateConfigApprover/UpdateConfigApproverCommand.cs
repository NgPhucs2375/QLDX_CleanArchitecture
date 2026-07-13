using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.UpdateConfigApprover
{
    public class UpdateConfigApproverCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public Guid ProposalConfigId { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid ApproverId { get; set; }
        public ApprovalLevel Level { get; set; }

        public class UpdateConfigApproverCommandHandler : IRequestHandler<UpdateConfigApproverCommand, Response<int>>
        {
            private readonly IConfigApproverRepositoryAsync _configApproverRepository;
            public UpdateConfigApproverCommandHandler(IConfigApproverRepositoryAsync configApproverRepository)
            {
                _configApproverRepository = configApproverRepository;
            }
            public async Task<Response<int>> Handle(UpdateConfigApproverCommand command, CancellationToken cancellationToken)
            {
                var configApprover = await _configApproverRepository.GetByIdAsync(command.Id);
                if (configApprover == null)
                {
                    throw new ApiException($"ConfigApprover Not Found.");
                }
                else
                {
                    configApprover.ProposalConfigId = command.ProposalConfigId;
                    configApprover.DepartmentId = command.DepartmentId;
                    configApprover.ApproverId = command.ApproverId;
                    configApprover.Level = command.Level;
                    await _configApproverRepository.UpdateAsync(configApprover);
                    return new Response<int>(configApprover.Id);
                }
            }
        }
    }
}
