using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetAllPurchaseRequestCategories
{
    public class GetAllPurchaseRequestCategoriesQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllPurchaseRequestCategoriesQueryHandler : IRequestHandler<GetAllPurchaseRequestCategoriesQuery, Response<object>>
    {
        private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
        private readonly IMapper _mapper;
        public GetAllPurchaseRequestCategoriesQueryHandler(IPurchaseRequestCategoryRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllPurchaseRequestCategoriesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllPurchaseRequestCategoriesParameter>(request);
            var entities = await _repository.GetPagedPurchaseRequestCategoriesAsync(validFilter);
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
