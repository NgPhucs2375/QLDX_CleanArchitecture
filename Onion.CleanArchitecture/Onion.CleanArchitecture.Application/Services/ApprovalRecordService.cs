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
        // Bơm repository vào 
        private readonly IPurchaseRequestApprovalRepositoryAsync _approvalRepository;
        private readonly IAuthenticatedUserService _authenticatedUser;

        // set cứng các trigger với nhãn hành động tương ứng để Record có thể nhận dạng 
        // với 1 Từ điểm gồm 2 tham số là các trigger và 1 string nhãn thành đông
        private static readonly Dictionary<PurchaseRequestTrigger, string> ActionLabels = new()
        {
            { PurchaseRequestTrigger.Submit, "Gửi phiếu" },
            { PurchaseRequestTrigger.ApproveDepartment, "Duyệt cấp đơn vị" },
            { PurchaseRequestTrigger.Approve, "Duyệt kiểm soát" },
            { PurchaseRequestTrigger.Reject, "Từ chối" },
            { PurchaseRequestTrigger.ReturnForEdit, "Trả chỉnh sửa" },
            { PurchaseRequestTrigger.ConfirmOrder, "Xác nhận đơn hàng" },
        };

        // Constructor của ApprovalRecordService nhận vào 2 tham số: approvalRepository và authenticatedUser
        public ApprovalRecordService(
            IPurchaseRequestApprovalRepositoryAsync approvalRepository,
            IAuthenticatedUserService authenticatedUser)
        {
            _approvalRepository = approvalRepository;
            _authenticatedUser = authenticatedUser;
        }
        // 
        public async Task RecordAsync(PurchaseRequest entity,PurchaseRequestStatus statusBefore, PurchaseRequestTrigger trigger, string note, CancellationToken ct)
        {
            // statusBfore : Trạng thái trước khi thực hiện trigger

            // Xác định trạng thái sau khi thực hiện trigger
            var statusAfter = entity.Status;
         

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
