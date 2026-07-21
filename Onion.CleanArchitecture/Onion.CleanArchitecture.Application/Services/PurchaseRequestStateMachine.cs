using Stateless;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.Application.Services
{
    public class PurchaseRequestStateMachine
    {
        private readonly StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger> _machine;
        private readonly PurchaseRequest _entity;
        private readonly IPurchaseRequestWorkflowService _workflowService;
        private readonly IApprovalRecordService _approvalRecordService;
        private readonly string _currentUserId;

        // Chỉ dùng tạm trong suốt vòng đời 1 lần gọi FireAsync — an toàn vì async await
        private string _currentNote;
        private CancellationToken _currentCt;

        // Handle cho Parameterized Triggers
        private readonly StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger>.TriggerWithParameters<string, CancellationToken>
            _submitTrigger,
            _approveDeptTrigger,
            _rejectTrigger,
            _returnTrigger,
            _approveTrigger,
            _confirmTrigger;

        public PurchaseRequestStateMachine(
            IPurchaseRequestWorkflowService workflowService,
            IApprovalRecordService approvalRecordService,
            PurchaseRequest entity,
            string currentUserId)
        {
            _entity = entity;
            _workflowService = workflowService;
            _approvalRecordService = approvalRecordService;
            _currentUserId = currentUserId;
            _machine = new StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger>(
                () => _entity.Status,
                s => _entity.Status = s
            );

            // Parameterized Triggers
            _submitTrigger = _machine.SetTriggerParameters<string, CancellationToken>(PurchaseRequestTrigger.Submit);
            _approveDeptTrigger = _machine.SetTriggerParameters<string, CancellationToken>(PurchaseRequestTrigger.ApproveDepartment);
            _rejectTrigger = _machine.SetTriggerParameters<string, CancellationToken>(PurchaseRequestTrigger.Reject);
            _returnTrigger = _machine.SetTriggerParameters<string, CancellationToken>(PurchaseRequestTrigger.ReturnForEdit);
            _approveTrigger = _machine.SetTriggerParameters<string, CancellationToken>(PurchaseRequestTrigger.Approve);
            _confirmTrigger = _machine.SetTriggerParameters<string, CancellationToken>(PurchaseRequestTrigger.ConfirmOrder);

            ConfigureTransitions();
        }

        public bool CanFire(PurchaseRequestTrigger trigger) => _machine.CanFire(trigger);

        public async Task<bool> CanFireAsync(PurchaseRequestTrigger trigger)
        {
            if (!_machine.CanFire(trigger))
                return false;

            try
            {
                await ValidateAuthorization(trigger);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task FireAsync(PurchaseRequestTrigger trigger, string note = "", CancellationToken ct = default)
        {
            if (!_machine.CanFire(trigger))
            {
                throw new ApiException($"Không thể thực hiện hành động '{trigger}' khi phiếu đang ở trạng thái '{_entity.Status}'.");
            }

            await ValidateAuthorization(trigger);

            _currentNote = string.IsNullOrWhiteSpace(note) ? GetDefaultNote(trigger) : note;
            _currentCt = ct;

            var paramTrigger = trigger switch
            {
                PurchaseRequestTrigger.Submit => _submitTrigger,
                PurchaseRequestTrigger.ApproveDepartment => _approveDeptTrigger,
                PurchaseRequestTrigger.Reject => _rejectTrigger,
                PurchaseRequestTrigger.ReturnForEdit => _returnTrigger,
                PurchaseRequestTrigger.Approve => _approveTrigger,
                PurchaseRequestTrigger.ConfirmOrder => _confirmTrigger,
                _ => throw new ArgumentOutOfRangeException(nameof(trigger))
            };

            await _machine.FireAsync(paramTrigger, _currentNote, _currentCt);

            _currentNote = null;
        }

        /// <summary>
        /// Guard kiểm tra quyền trước khi cho phép trigger fire.
        /// </summary>
        private async Task ValidateAuthorization(PurchaseRequestTrigger trigger)
        {
            // Nên tạo thành Dictionnary <trigger,Role>
            switch (trigger)
            {
                // Chỉ người tạo phiếu mới được gửi duyệt lại khi phiếu đang ở trạng thái ReturnedForEdit
                case PurchaseRequestTrigger.Submit when _entity.Status == PurchaseRequestStatus.ReturnedForEdit:
                    if (_currentUserId != _entity.CreatedBy)
                        throw new ApiException("Chỉ người tạo phiếu mới được gửi duyệt lại.");
                    break;
                // Chỉ người tạo phiếu mới được gửi duyệt lần đầu khi phiếu đang ở trạng thái Draft
                case PurchaseRequestTrigger.Submit:
                    break;
                // Chỉ người duyệt phiếu là trưởng bộ phận mới được duyệt hoặc từ chối khi phiếu đang ở trạng thái PendingDepartment
                case PurchaseRequestTrigger.ApproveDepartment:
                case PurchaseRequestTrigger.Reject when _entity.Status == PurchaseRequestStatus.PendingDepartment:
                    await _workflowService.ValidateApproverForCurrentStep(_entity);
                    break;
                // Chỉ người duyệt phiếu là cấp kiểm soát mới có thể duyệt hoặc từ chối hoặc yêu cầu chỉnh sửa khi phiếu đang ở trạng thái PendingControl
                case PurchaseRequestTrigger.Approve:
                case PurchaseRequestTrigger.Reject when _entity.Status == PurchaseRequestStatus.PendingControl:
                case PurchaseRequestTrigger.ReturnForEdit:
                    await _workflowService.ValidateApproverForCurrentStep(_entity);
                    break;

                // Chỉ người tạo phiếu mới được xác nhận đơn hàng và nhập số lượng thực thế khi phiếu đang ở trạng thái chờ
                case PurchaseRequestTrigger.ConfirmOrder:
                    if (_currentUserId != _entity.CreatedBy)
                        throw new ApiException("Chỉ người tạo phiếu mới được xác nhận đơn hàng.");
                    break;
            }
        }

        /// <summary>
        /// Hook chạy sau mỗi transition — ghi lịch sử duyệt tự động.
        /// </summary>
        private Task OnTransitedAsync(StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger>.Transition transition)
        {
            var trigger = (PurchaseRequestTrigger)transition.Trigger;
            return _approvalRecordService.RecordAsync(
                _entity,
                (PurchaseRequestStatus)transition.Source,
                trigger,
                _currentNote ?? GetDefaultNote(trigger),
                _currentCt
            );
        }

        private void ConfigureTransitions()
        {
            _machine.Configure(PurchaseRequestStatus.Draft)
                .PermitDynamicAsync(PurchaseRequestTrigger.Submit, async () =>
                {
                    await _workflowService.SubmitAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.PendingDepartment;
                });

            _machine.Configure(PurchaseRequestStatus.PendingDepartment)
                .OnEntryAsync(OnTransitedAsync)
                .PermitDynamicAsync(PurchaseRequestTrigger.ApproveDepartment, async () =>
                {
                    await _workflowService.ApproveByDepartmentAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.PendingControl;
                })
                .PermitDynamicAsync(PurchaseRequestTrigger.Reject, async () =>
                {
                    await _workflowService.RejectedByDepartmentAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.RejectedByDepartment;
                });

            _machine.Configure(PurchaseRequestStatus.PendingControl)
                .OnEntryAsync(OnTransitedAsync)
                .PermitDynamicAsync(PurchaseRequestTrigger.Approve, async () =>
                {
                    await _workflowService.ApproveByControlAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.PendingOrderConfirm;
                })
                .PermitDynamicAsync(PurchaseRequestTrigger.Reject, async () =>
                {
                    await _workflowService.RejectedByControlAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.RejectedByControl;
                })
                .PermitDynamicAsync(PurchaseRequestTrigger.ReturnForEdit, async () =>
                {
                    await _workflowService.ReturnForEditByControlAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.ReturnedForEdit;
                });

            _machine.Configure(PurchaseRequestStatus.ReturnedForEdit)
                .OnEntryAsync(OnTransitedAsync)
                .PermitDynamicAsync(PurchaseRequestTrigger.Submit, async () =>
                {
                    await _workflowService.SubmitAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.PendingDepartment;
                });

            _machine.Configure(PurchaseRequestStatus.PendingOrderConfirm)
                .OnEntryAsync(OnTransitedAsync)
                .PermitDynamicAsync(PurchaseRequestTrigger.ConfirmOrder, async () =>
                {
                    await _workflowService.ConfirmOrderAsync(_entity, _currentNote, _currentCt);
                    return PurchaseRequestStatus.Completed;
                });

            _machine.Configure(PurchaseRequestStatus.RejectedByDepartment)
                .OnEntryAsync(OnTransitedAsync);
            _machine.Configure(PurchaseRequestStatus.RejectedByControl)
                .OnEntryAsync(OnTransitedAsync);
            _machine.Configure(PurchaseRequestStatus.Completed)
                .OnEntryAsync(OnTransitedAsync);
        }

        private string GetDefaultNote(PurchaseRequestTrigger trigger)
            => _approvalRecordService.GetDefaultNote(trigger);
    }
}