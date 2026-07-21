// using System.Numerics;
// using System.Threading;
// using System.Threading.Tasks;
// using MediatR;
// using Onion.CleanArchitecture.Domain.Entities;
// namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Events
// {
//     public class PurchaseRequestProcessedEventHandler : INotificationHandler<PurchaseRequestProcessedEvent>
//     {

//         private readonly IUnitOfWork<int> _unitOfWork;

//         public PurchaseRequestProcessedEventHandler(IUnitOfWork<int> unitOfWork)
//         {
//             _unitOfWork = unitOfWork;
//         }
//         public Task Handle(PurchaseRequestProcessedEvent notification, CancellationToken cancellationToken)
//         {
//            var approvalLog = new PurchaseRequestApproval{
//             PurchaseRequestId = notification.PurchaseRequestId,
//             ApproverId = notification.ApproverId,
//             ApproverName = notification.ApproverName,
//             FromStatus = notification.FromStatus,
//             ToStatus = notification.ToStatus,
//             Action = notification.Action,
//             Note = notification.Note
//            };

//            //Save
//            await _unitOfWork.Repository<PurchaseRequestApproval>().AddAsync<approvalLog>;
//            await _unitOfWork.Commit(cancellationToken);
//         }
//     }
// }