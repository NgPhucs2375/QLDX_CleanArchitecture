using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
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
            public GetPurchaseRequestByIdQueryHandler(IPurchaseRequestRepositoryAsync purchaseRequestRepository)
            {
                _purchaseRequestRepository = purchaseRequestRepository;
            }
            public async Task<Response<PurchaseRequest>> Handle(GetPurchaseRequestByIdQuery query, CancellationToken cancellationToken)
            {
                var entity = await _purchaseRequestRepository.GetByIdWithDetailsAsync(query.Id);
                if (entity == null) throw new ApiException($"PurchaseRequest Not Found.");
                return new Response<PurchaseRequest>(entity);
            }
        }
    }
}
