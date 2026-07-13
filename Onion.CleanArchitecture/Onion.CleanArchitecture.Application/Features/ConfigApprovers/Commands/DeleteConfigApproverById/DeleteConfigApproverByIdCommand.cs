using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.DeleteConfigApproverById
{
    public class DeleteConfigApproverByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeleteConfigApproverByIdCommandHandler : IRequestHandler<DeleteConfigApproverByIdCommand, Response<int>>
        {
            private readonly IConfigApproverRepositoryAsync _configApproverRepository;
            public DeleteConfigApproverByIdCommandHandler(IConfigApproverRepositoryAsync configApproverRepository)
            {
                _configApproverRepository = configApproverRepository;
            }
            public async Task<Response<int>> Handle(DeleteConfigApproverByIdCommand command, CancellationToken cancellationToken)
            {
                var configApprover = await _configApproverRepository.GetByIdAsync(command.Id);
                if (configApprover == null) throw new ApiException($"ConfigApprover Not Found.");
                await _configApproverRepository.DeleteAsync(configApprover);
                return new Response<int>(configApprover.Id);
            }
        }
    }
}
