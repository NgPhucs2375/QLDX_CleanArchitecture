using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.DeleteConfigCategoryById
{
    public class DeleteConfigCategoryByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeleteConfigCategoryByIdCommandHandler : IRequestHandler<DeleteConfigCategoryByIdCommand, Response<int>>
        {
            private readonly IConfigCategoryRepositoryAsync _configCategoryRepository;
            public DeleteConfigCategoryByIdCommandHandler(IConfigCategoryRepositoryAsync configCategoryRepository)
            {
                _configCategoryRepository = configCategoryRepository;
            }
            public async Task<Response<int>> Handle(DeleteConfigCategoryByIdCommand command, CancellationToken cancellationToken)
            {
                var configCategory = await _configCategoryRepository.GetByIdAsync(command.Id);
                if (configCategory == null) throw new ApiException($"ConfigCategory Not Found.");
                await _configCategoryRepository.DeleteAsync(configCategory);
                return new Response<int>(configCategory.Id);
            }
        }
    }
}
