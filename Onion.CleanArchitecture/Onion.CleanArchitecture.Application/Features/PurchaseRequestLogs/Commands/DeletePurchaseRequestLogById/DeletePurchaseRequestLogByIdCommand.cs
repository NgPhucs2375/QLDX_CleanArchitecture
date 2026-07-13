using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.DeletePurchaseRequestLogById
{
    public class DeletePurchaseRequestLogByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeletePurchaseRequestLogByIdCommandHandler : IRequestHandler<DeletePurchaseRequestLogByIdCommand, Response<int>>
        {
            private readonly IPurchaseRequestLogRepositoryAsync _repository;
            public DeletePurchaseRequestLogByIdCommandHandler(IPurchaseRequestLogRepositoryAsync repository)
            {
                _repository = repository;
            }
            public async Task<Response<int>> Handle(DeletePurchaseRequestLogByIdCommand command, CancellationToken cancellationToken)
            {
                var entity = await _repository.GetByIdAsync(command.Id);
                if (entity == null) throw new ApiException($"PurchaseRequestLog Not Found.");
                await _repository.DeleteAsync(entity);
                return new Response<int>(entity.Id);
            }
        }
    }
}
