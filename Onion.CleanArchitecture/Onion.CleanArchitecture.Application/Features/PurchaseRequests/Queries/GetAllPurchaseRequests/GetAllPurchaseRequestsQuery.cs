using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests
{
    public class GetAllPurchaseRequestsQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllPurchaseRequestsQueryHandler : IRequestHandler<GetAllPurchaseRequestsQuery, Response<object>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
        private readonly IMapper _mapper;
        public GetAllPurchaseRequestsQueryHandler(IPurchaseRequestRepositoryAsync purchaseRequestRepository, IMapper mapper)
        {
            _purchaseRequestRepository = purchaseRequestRepository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllPurchaseRequestsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllPurchaseRequestsParameter>(request);
            var entities = await _purchaseRequestRepository.GetPagedPurchaseRequestsAsync(validFilter);
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
