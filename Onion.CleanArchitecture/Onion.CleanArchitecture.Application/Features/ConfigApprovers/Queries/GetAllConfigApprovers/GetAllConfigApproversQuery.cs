using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers
{
    public class GetAllConfigApproversQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllConfigApproversQueryHandler : IRequestHandler<GetAllConfigApproversQuery, Response<object>>
    {
        private readonly IConfigApproverRepositoryAsync _configApproverRepository;
        private readonly IMapper _mapper;
        public GetAllConfigApproversQueryHandler(IConfigApproverRepositoryAsync configApproverRepository, IMapper mapper)
        {
            _configApproverRepository = configApproverRepository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllConfigApproversQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllConfigApproversParameter>(request);
            var configApprovers = await _configApproverRepository.GetPagedConfigApproversAsync(validFilter);
            return new Response<object>(true, new
            {
                configApprovers._start,
                configApprovers._end,
                configApprovers._total,
                configApprovers._hasNext,
                configApprovers._hasPrevious,
                configApprovers._pages,
                _data = configApprovers
            }, message: "Success");
        }
    }
}
