using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Categories.Commands.UpdateCategory
{
    public class UpdateCategoryCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }

        public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Response<int>>
        {
            private readonly ICategoryRepositoryAsync _categoryRepository;
            public UpdateCategoryCommandHandler(ICategoryRepositoryAsync categoryRepository)
            {
                _categoryRepository = categoryRepository;
            }
            public async Task<Response<int>> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
            {
                var category = await _categoryRepository.GetByIdAsync(command.Id);

                if (category == null)
                {
                    throw new ApiException($"Category Not Found.");
                }
                else
                {
                    category.Code = command.Code;
                    category.Name = command.Name;
                    category.IsActive = command.IsActive;
                    await _categoryRepository.UpdateAsync(category);
                    return new Response<int>(category.Id);
                }
            }
        }
    }
}
