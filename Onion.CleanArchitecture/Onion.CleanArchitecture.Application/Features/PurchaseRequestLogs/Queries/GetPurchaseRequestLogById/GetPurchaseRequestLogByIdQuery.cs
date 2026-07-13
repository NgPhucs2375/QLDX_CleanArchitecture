using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetPurchaseRequestLogById
{
    public class GetPurchaseRequestLogByIdQuery : IRequest<Response<PurchaseRequestLog>>
    {
        public int Id { get; set; }
        public class GetPurchaseRequestLogByIdQueryHandler : IRequestHandler<GetPurchaseRequestLogByIdQuery, Response<PurchaseRequestLog>>
        {
            private readonly IPurchaseRequestLogRepositoryAsync _repository;
            public GetPurchaseRequestLogByIdQueryHandler(IPurchaseRequestLogRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<PurchaseRequestLog>> Handle(GetPurchaseRequestLogByIdQuery query, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(query.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestLog Not Found.");
                return new Response<PurchaseRequestLog>(entity);
            }
        }
    }
}
