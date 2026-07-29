using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Extensions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
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
        private readonly ISagaInstanceRepository _sagaRepo;
        private readonly IMapper _mapper;
        public GetAllPurchaseRequestsQueryHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepository,
            ISagaInstanceRepository sagaRepo,
            IMapper mapper)
        {
            _purchaseRequestRepository = purchaseRequestRepository;
            _sagaRepo = sagaRepo;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllPurchaseRequestsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllPurchaseRequestsParameter>(request);
            var entities = await _purchaseRequestRepository.GetPagedPurchaseRequestsAsync(validFilter);

            var requestIds = entities.Select(e => e.Id).ToList();
            var sagaStates = await _sagaRepo.GetStatesByRequestIdsAsync(requestIds);

            var viewModels = entities.Select(e => new GetAllPurchaseRequestsViewModel
            {
                Id = e.Id,
                Code = e.Code,
                DepartmentId = e.DepartmentId,
                ProposalConfigId = e.ProposalConfigId,
                Status = sagaStates.TryGetValue(e.Id, out var state)
                    ? state.MapToPurchaseRequestStatus()
                    : PurchaseRequestStatus.Draft,
                TotalProposedAmount = e.TotalProposedAmount,
                TotalActualAmount = e.TotalActualAmount
            }).ToList();

            var pagedViewModels = new PagedList<GetAllPurchaseRequestsViewModel>(
                viewModels, entities._total, entities._start, entities._end);

            return new Response<object>(true, new
            {
                pagedViewModels._start,
                pagedViewModels._end,
                pagedViewModels._total,
                pagedViewModels._hasNext,
                pagedViewModels._hasPrevious,
                pagedViewModels._pages,
                _data = pagedViewModels
            }, message: "Success");
        }
    }
}
