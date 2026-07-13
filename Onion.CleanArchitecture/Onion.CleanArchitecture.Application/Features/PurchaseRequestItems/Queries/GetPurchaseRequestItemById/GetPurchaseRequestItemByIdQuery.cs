using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetPurchaseRequestItemById
{
    public class GetPurchaseRequestItemByIdQuery : IRequest<Response<PurchaseRequestItem>>
    {
        public int Id { get; set; }
        public class GetPurchaseRequestItemByIdQueryHandler : IRequestHandler<GetPurchaseRequestItemByIdQuery, Response<PurchaseRequestItem>>
        {
            private readonly IPurchaseRequestItemRepositoryAsync _repository;
            public GetPurchaseRequestItemByIdQueryHandler(IPurchaseRequestItemRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<PurchaseRequestItem>> Handle(GetPurchaseRequestItemByIdQuery query, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(query.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestItem Not Found.");
                return new Response<PurchaseRequestItem>(entity);
            }
        }
    }
}
