using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetAllProposalConfigs
{
    public class GetAllProposalConfigsQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllProposalConfigsQueryHandler : IRequestHandler<GetAllProposalConfigsQuery, Response<object>>
    {
        private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
        private readonly IMapper _mapper;
        public GetAllProposalConfigsQueryHandler(IProposalConfigRepositoryAsync proposalConfigRepository, IMapper mapper)
        {
            _proposalConfigRepository = proposalConfigRepository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllProposalConfigsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllProposalConfigsParameter>(request);
            var proposalConfigs = await _proposalConfigRepository.GetPagedProposalConfigsAsync(validFilter);
            return new Response<object>(true, new
            {
                proposalConfigs._start,
                proposalConfigs._end,
                proposalConfigs._total,
                proposalConfigs._hasNext,
                proposalConfigs._hasPrevious,
                proposalConfigs._pages,
                _data = proposalConfigs
            }, message: "Success");
        }
    }
}
