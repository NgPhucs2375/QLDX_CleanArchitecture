using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.DeletePurchaseRequestCategoryById
{
    public class DeletePurchaseRequestCategoryByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeletePurchaseRequestCategoryByIdCommandHandler : IRequestHandler<DeletePurchaseRequestCategoryByIdCommand, Response<int>>
        {
            private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
            public DeletePurchaseRequestCategoryByIdCommandHandler(IPurchaseRequestCategoryRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<int>> Handle(DeletePurchaseRequestCategoryByIdCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestCategory Not Found.");
                await _repository.DeleteAsync(entity);
                return new Response<int>(entity.Id);
            }
        }
    }
}
