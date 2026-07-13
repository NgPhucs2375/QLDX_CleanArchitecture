using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetPurchaseRequestCategoryById
{
    public class GetPurchaseRequestCategoryByIdQuery : IRequest<Response<PurchaseRequestCategory>>
    {
        public int Id { get; set; }
        public class GetPurchaseRequestCategoryByIdQueryHandler : IRequestHandler<GetPurchaseRequestCategoryByIdQuery, Response<PurchaseRequestCategory>>
        {
            private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
            public GetPurchaseRequestCategoryByIdQueryHandler(IPurchaseRequestCategoryRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<PurchaseRequestCategory>> Handle(GetPurchaseRequestCategoryByIdQuery query, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(query.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestCategory Not Found.");
                return new Response<PurchaseRequestCategory>(entity);
            }
        }
    }
}
