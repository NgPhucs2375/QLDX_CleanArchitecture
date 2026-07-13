using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetConfigCategoryById
{
    public class GetConfigCategoryByIdQuery : IRequest<Response<ConfigCategory>>
    {
        public int Id { get; set; }
        public class GetConfigCategoryByIdQueryHandler : IRequestHandler<GetConfigCategoryByIdQuery, Response<ConfigCategory>>
        {
            private readonly IConfigCategoryRepositoryAsync _configCategoryRepository;
            public GetConfigCategoryByIdQueryHandler(IConfigCategoryRepositoryAsync configCategoryRepository)
            {
                _configCategoryRepository = configCategoryRepository;
            }
            public async Task<Response<ConfigCategory>> Handle(GetConfigCategoryByIdQuery query, CancellationToken cancellationToken)
            {
                var configCategory = await _configCategoryRepository.GetByIdAsync(query.Id);
                if (configCategory == null) throw new ApiException($"ConfigCategory Not Found.");
                return new Response<ConfigCategory>(configCategory);
            }
        }
    }
}
