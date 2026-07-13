using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories
{
    public class GetAllConfigCategoriesQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllConfigCategoriesQueryHandler : IRequestHandler<GetAllConfigCategoriesQuery, Response<object>>
    {
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepository;
        private readonly IMapper _mapper;
        public GetAllConfigCategoriesQueryHandler(IConfigCategoryRepositoryAsync configCategoryRepository, IMapper mapper)
        {
            _configCategoryRepository = configCategoryRepository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllConfigCategoriesQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllConfigCategoriesParameter>(request);
            var configCategories = await _configCategoryRepository.GetPagedConfigCategoriesAsync(validFilter);
            return new Response<object>(true, new
            {
                configCategories._start,
                configCategories._end,
                configCategories._total,
                configCategories._hasNext,
                configCategories._hasPrevious,
                configCategories._pages,
                _data = configCategories
            }, message: "Success");
        }
    }
}
