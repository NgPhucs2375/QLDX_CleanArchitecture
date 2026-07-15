using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Services
{
    public class ApprovalRecordService : IApprovalRecordService
    {
        private readonly IPurchaseRequestApprovalRepositoryAsync _approvalRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        private static readonly Dictionary<PurchaseRequestTrigger, string> ActionLabels = new()
        {
            { PurchaseRequestTrigger.Submit, "Gửi phiếu" },
            { PurchaseRequestTrigger.ApproveDepartment, "Duyệt cấp đơn vị" },
            { PurchaseRequestTrigger.Approve, "Duyệt kiểm soát" },
            { PurchaseRequestTrigger.Reject, "Từ chối" },
            { PurchaseRequestTrigger.ReturnForEdit, "Trả chỉnh sửa" },
            { PurchaseRequestTrigger.ConfirmOrder, "Xác nhận đơn hàng" },
            { PurchaseRequestTrigger.Complete, "Hoàn thành" },
        };

        public ApprovalRecordService(
            IPurchaseRequestApprovalRepositoryAsync approvalRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _approvalRepository = approvalRepository;
            _authenticatedUser = authenticatedUser;
        }

        public async Task RecordAsync(PurchaseRequest entity, PurchaseRequestTrigger trigger, string note, CancellationToken ct)
        {
            var statusBefore = entity.Status;
            var statusAfter = trigger switch
            {
                PurchaseRequestTrigger.Submit => PurchaseRequestStatus.PendingDepartment,
                PurchaseRequestTrigger.ApproveDepartment => PurchaseRequestStatus.PendingControl,
                PurchaseRequestTrigger.Approve => PurchaseRequestStatus.Approved,
                PurchaseRequestTrigger.Reject => statusBefore == PurchaseRequestStatus.PendingDepartment
                    ? PurchaseRequestStatus.RejectedByDepartment
                    : PurchaseRequestStatus.RejectedByControl,
                PurchaseRequestTrigger.ReturnForEdit => PurchaseRequestStatus.ReturnedForEdit,
                PurchaseRequestTrigger.ConfirmOrder => PurchaseRequestStatus.PendingOrderConfirm,
                PurchaseRequestTrigger.Complete => PurchaseRequestStatus.Completed,
                _ => statusBefore,
            };

            var approval = new PurchaseRequestApproval
            {
                PurchaseRequestId = entity.Id,
                ApproverId = _authenticatedUser.UserId ?? string.Empty,
                ApproverName = string.Empty,
                FromStatus = statusBefore,
                ToStatus = statusAfter,
                Action = ActionLabels.GetValueOrDefault(trigger, trigger.ToString()),
                Note = note ?? string.Empty,
            };

            await _approvalRepository.AddAsync(approval);
        }
    }
}
