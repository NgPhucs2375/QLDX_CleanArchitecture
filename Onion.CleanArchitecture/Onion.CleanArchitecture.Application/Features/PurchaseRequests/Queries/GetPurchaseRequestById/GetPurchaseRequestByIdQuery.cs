using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Extensions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetPurchaseRequestById
{
    public class GetPurchaseRequestByIdQuery : IRequest<Response<PurchaseRequest>>
    {
        public int Id { get; set; }
        public class GetPurchaseRequestByIdQueryHandler : IRequestHandler<GetPurchaseRequestByIdQuery, Response<PurchaseRequest>>
        {
            private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
            private readonly ISagaInstanceRepository _sagaRepo;
            public GetPurchaseRequestByIdQueryHandler(
                IPurchaseRequestRepositoryAsync purchaseRequestRepository,
                ISagaInstanceRepository sagaRepo)
            {
                _purchaseRequestRepository = purchaseRequestRepository;
                _sagaRepo = sagaRepo;
            }
            public async Task<Response<PurchaseRequest>> Handle(GetPurchaseRequestByIdQuery query, CancellationToken cancellationToken)
            {
                var entity = await _purchaseRequestRepository.GetByIdWithDetailsAsync(query.Id);
                if (entity == null) throw new ApiException($"PurchaseRequest Not Found.");

                var sagaState = await _sagaRepo.GetCurrentStateByRequestIdAsync(query.Id);
                entity.Status = sagaState.MapToPurchaseRequestStatus();

                return new Response<PurchaseRequest>(entity);
            }
        }
    }
}
