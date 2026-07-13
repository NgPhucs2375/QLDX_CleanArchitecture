using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Categories.Commands.DeleteCategoryById
{
    public class DeleteCategoryByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeleteCategoryByIdCommandHandler : IRequestHandler<DeleteCategoryByIdCommand, Response<int>>
        {
            private readonly ICategoryRepositoryAsync _categoryRepository;
            public DeleteCategoryByIdCommandHandler(ICategoryRepositoryAsync categoryRepository)
            {
                _categoryRepository = categoryRepository;
            }
            public async Task<Response<int>> Handle(DeleteCategoryByIdCommand command, CancellationToken cancellationToken)
            {
                var category = await _categoryRepository.GetByIdAsync(command.Id);
                if (category == null) throw new ApiException($"Category Not Found.");
                await _categoryRepository.DeleteAsync(category);
                return new Response<int>(category.Id);
            }
        }
    }
}
