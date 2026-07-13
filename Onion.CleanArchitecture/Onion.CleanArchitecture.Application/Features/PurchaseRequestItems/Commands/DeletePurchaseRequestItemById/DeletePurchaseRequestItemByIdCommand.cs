using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.DeletePurchaseRequestItemById
{
    public class DeletePurchaseRequestItemByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeletePurchaseRequestItemByIdCommandHandler : IRequestHandler<DeletePurchaseRequestItemByIdCommand, Response<int>>
        {
            private readonly IPurchaseRequestItemRepositoryAsync _repository;
            public DeletePurchaseRequestItemByIdCommandHandler(IPurchaseRequestItemRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<int>> Handle(DeletePurchaseRequestItemByIdCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestItem Not Found.");
                await _repository.DeleteAsync(entity);
                return new Response<int>(entity.Id);
            }
        }
    }
}
