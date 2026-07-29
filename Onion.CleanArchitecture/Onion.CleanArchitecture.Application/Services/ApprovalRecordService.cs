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
        private readonly IUserLookupService _userLookup;

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
            { PurchaseRequestTrigger.Update, "Cập nhật phiếu" },
        };

        // Constructor của ApprovalRecordService nhận vào 2 tham số: approvalRepository và authenticatedUser
        public ApprovalRecordService(
            IPurchaseRequestApprovalRepositoryAsync approvalRepository,
            IAuthenticatedUserService authenticatedUser,
            IUserLookupService userLookup)
        {
            _approvalRepository = approvalRepository;
            _authenticatedUser = authenticatedUser;
            _userLookup = userLookup;
        }
        // 
        public async Task RecordAsync(PurchaseRequest entity, PurchaseRequestTrigger trigger, string note, CancellationToken ct)
        {
            
         

            var approval = new PurchaseRequestApproval
            {
                PurchaseRequestId = entity.Id,
                ApproverId = _authenticatedUser.UserId ?? string.Empty,
                ApproverName = await _userLookup.GetDisplayNameAsync(_authenticatedUser.UserId ?? string.Empty),
                Action = ActionLabels.GetValueOrDefault(trigger, trigger.ToString()),
                Note = note ?? string.Empty,
            };

            await _approvalRepository.AddAsync(approval);
        }
        public string GetDefaultNote(PurchaseRequestTrigger trigger)
        {
            return trigger switch
            {
                PurchaseRequestTrigger.Submit => "Khởi tạo và trình duyệt phiếu đề xuất",
                PurchaseRequestTrigger.ApproveDepartment => "Trưởng đơn vị đã phê duyệt",
                PurchaseRequestTrigger.Reject => "Đã từ chối phiếu đề xuất",
                PurchaseRequestTrigger.Approve => "Cấp kiểm soát đã phê duyệt",
                PurchaseRequestTrigger.ReturnForEdit => "Yêu cầu chỉnh sửa lại phiếu đề xuất",
                PurchaseRequestTrigger.ConfirmOrder => "Đã xác nhận đơn hàng và nhập số lượng thực tế",
                PurchaseRequestTrigger.Update => "Cập nhật thông tin phiếu đề xuất",
                _ => "Hệ thống tự động ghi nhận hành động"
            };
        }
    }
}
