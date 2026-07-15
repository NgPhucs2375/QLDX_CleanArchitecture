using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetCascadeCreateData
{
    public class GetCascadeProductsQuery : IRequest<Response<List<CascadeProductDto>>>
    {
        public int CategoryId { get; set; }
    }

    public class CascadeProductDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public decimal UnitPrice { get; set; }
        public string Unit { get; set; }
    }

    public class GetCascadeProductsQueryHandler : IRequestHandler<GetCascadeProductsQuery, Response<List<CascadeProductDto>>>
    {
        private readonly IProductRepositoryAsync _productRepo;

        public GetCascadeProductsQueryHandler(IProductRepositoryAsync productRepo)
        {
            _productRepo = productRepo;
        }

        public async Task<Response<List<CascadeProductDto>>> Handle(GetCascadeProductsQuery request, CancellationToken ct)
        {
            var products = await _productRepo.GetByCategoryIdAsync(request.CategoryId);

            var dtos = products.Select(p => new CascadeProductDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                UnitPrice = p.UnitPrice,
                Unit = p.Unit,
            }).ToList();

            return new Response<List<CascadeProductDto>>(dtos);
        }
    }
}
