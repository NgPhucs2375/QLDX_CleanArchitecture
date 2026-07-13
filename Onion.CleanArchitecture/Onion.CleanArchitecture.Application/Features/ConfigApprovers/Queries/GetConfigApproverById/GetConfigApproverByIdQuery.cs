using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetConfigApproverById
{
    public class GetConfigApproverByIdQuery : IRequest<Response<ConfigApprover>>
    {
        public int Id { get; set; }
        public class GetConfigApproverByIdQueryHandler : IRequestHandler<GetConfigApproverByIdQuery, Response<ConfigApprover>>
        {
            private readonly IConfigApproverRepositoryAsync _configApproverRepository;
            public GetConfigApproverByIdQueryHandler(IConfigApproverRepositoryAsync configApproverRepository)
            {
                _configApproverRepository = configApproverRepository;
            }
            public async Task<Response<ConfigApprover>> Handle(GetConfigApproverByIdQuery query, CancellationToken cancellationToken)
            {
                var configApprover = await _configApproverRepository.GetByIdAsync(query.Id);
                if (configApprover == null) throw new ApiException($"ConfigApprover Not Found.");
                return new Response<ConfigApprover>(configApprover);
            }
        }
    }
}
