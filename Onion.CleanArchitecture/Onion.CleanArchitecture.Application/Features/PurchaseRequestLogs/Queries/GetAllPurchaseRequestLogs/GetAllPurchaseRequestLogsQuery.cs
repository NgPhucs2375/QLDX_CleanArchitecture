using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs
{
    public class GetAllPurchaseRequestLogsQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllPurchaseRequestLogsQueryHandler : IRequestHandler<GetAllPurchaseRequestLogsQuery, Response<object>>
    {
        private readonly IPurchaseRequestLogRepositoryAsync _repository;
        private readonly IMapper _mapper;
        public GetAllPurchaseRequestLogsQueryHandler(IPurchaseRequestLogRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllPurchaseRequestLogsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllPurchaseRequestLogsParameter>(request);
            var entities = await _repository.GetPagedPurchaseRequestLogsAsync(validFilter);
            return new Response<object>(true, new
            {
                entities._start,
                entities._end,
                entities._total,
                entities._hasNext,
                entities._hasPrevious,
                entities._pages,
                _data = entities
            }, message: "Success");
        }
    }
}
