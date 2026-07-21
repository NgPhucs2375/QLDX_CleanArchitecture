using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.DeletePurchaseRequestById
{
    public class DeletePurchaseRequestByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeletePurchaseRequestByIdCommandHandler : IRequestHandler<DeletePurchaseRequestByIdCommand, Response<int>>
        {
            private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
            public DeletePurchaseRequestByIdCommandHandler(IPurchaseRequestRepositoryAsync purchaseRequestRepository)
            {
                _purchaseRequestRepository = purchaseRequestRepository;
            }
            public async Task<Response<int>> Handle(DeletePurchaseRequestByIdCommand command, CancellationToken cancellationToken)
            {
                var entity = await _purchaseRequestRepository.GetByIdAsync(command.Id);
                if (entity == null) throw new ApiException($"PurchaseRequest Not Found.");
                if (entity.Status != PurchaseRequestStatus.Draft)
                {
                    throw new ApiException($"Không thể xóa phiếu đề xuất đang ở trạng thái {entity.Status}. Chỉ cho phép xóa phiếu Nháp.");
                }
                await _purchaseRequestRepository.DeleteAsync(entity);
                return new Response<int>(entity.Id);
            }
        }
    }
}
