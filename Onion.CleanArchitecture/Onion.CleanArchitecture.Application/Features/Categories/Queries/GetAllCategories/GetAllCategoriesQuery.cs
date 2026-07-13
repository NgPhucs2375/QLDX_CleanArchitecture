using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Categories.Queries.GetAllCategories
{
    public class GetAllCategoriesQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, Response<object>>
    {
        private readonly ICategoryRepositoryAsync _categoryRepository;
        private readonly IMapper _mapper;
        public GetAllCategoriesQueryHandler(ICategoryRepositoryAsync categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllCategoriesParameter>(request);
            var categories = await _categoryRepository.GetPagedCategoriesAsync(validFilter);
            return new Response<object>(true, new
            {
                categories._start,
                categories._end,
                categories._total,
                categories._hasNext,
                categories._hasPrevious,
                categories._pages,
                _data = categories
            }, message: "Success");
        }
    }
}
