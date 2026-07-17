using Stateless;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Onion.CleanArchitecture.Application.Exceptions;

namespace Onion.CleanArchitecture.Application.Services
{
    public class PurchaseRequestStateMachine
    {
        private readonly StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger> _machine;
        private readonly PurchaseRequest _entity;

        private readonly IPurchaseRequestWorkflowService _workflowService;

        public PurchaseRequestStateMachine(IPurchaseRequestWorkflowService workflowService,PurchaseRequest entity)
        {
            _entity = entity;
            _workflowService = workflowService;
            _machine = new StateMachine<PurchaseRequestStatus, PurchaseRequestTrigger>(
                () => _entity.Status, // Đọc
                s => _entity.Status = s // Ghi
            );
            ConfigureTransitions();
        }
        public bool CanFire(PurchaseRequestTrigger trigger) => _machine.CanFire(trigger);
        public async Task FireAsync(PurchaseRequestTrigger trigger){
            if(!_machine.CanFire(trigger))
            {
                throw new ApiException($" Không thể {trigger} trong trạn thái hiện tại ({_entity.Status})!");
            }
            // thực hiện chuyển status
            await _machine.FireAsync(trigger);
        }

            private void ConfigureTransitions(){

            _machine.Configure(PurchaseRequestStatus.Draft)
                .PermitDynamicAsync(PurchaseRequestTrigger.Submit, 
                async () =>
                {
                    await _workflowService.SubmitAsync(_entity,"Đã trình duyệt",default);
                    return PurchaseRequestStatus.PendingDepartment;
                }
                );

            _machine.Configure(PurchaseRequestStatus.PendingDepartment)
                .PermitDynamicAsync(PurchaseRequestTrigger.ApproveDepartment, async () =>
                {
                    await _workflowService.ApproveByDepartmentAsync(_entity, "Trưởng Đơn Vị Đã Phê Duyệt", default);
                    return PurchaseRequestStatus.PendingControl;
                })
                .PermitDynamicAsync(PurchaseRequestTrigger.Reject, async () =>
                {
                    await _workflowService.RejectedByDepartmentAsync(_entity, "Trưởng Đơn Vị Đã Từ Chối", default);
                    return PurchaseRequestStatus.RejectedByDepartment;
                });
            _machine.Configure(PurchaseRequestStatus.PendingControl)
                .PermitDynamicAsync(PurchaseRequestTrigger.Approve,async () =>{
                    await _workflowService.ApproveByControlAsync(_entity, "Cấp Kiểm Soát Đã Phê Duyệt", default);
                    return PurchaseRequestStatus.PendingOrderConfirm;})
                .PermitDynamicAsync(PurchaseRequestTrigger.Reject, async () =>
                {
                    await _workflowService.RejectedByControlAsync(_entity, "Cấp Kiểm Soát Đã Từ Chối", default);
                    return PurchaseRequestStatus.RejectedByControl;
                })
                .PermitDynamicAsync(PurchaseRequestTrigger.ReturnForEdit, async () =>
                {
                    await _workflowService.ReturnForEditByControlAsync(_entity, "Cấp Kiểm Soát Yêu Cầu Sửa Đổi", default);
                    return PurchaseRequestStatus.ReturnedForEdit;
                });

            _machine.Configure(PurchaseRequestStatus.ReturnedForEdit)
                .PermitDynamicAsync(PurchaseRequestTrigger.Submit, 
                async () =>
                {
                    await _workflowService.SubmitAsync(_entity,"Đã trình duyệt",default);
                   return PurchaseRequestStatus.PendingDepartment;
                });

            _machine.Configure(PurchaseRequestStatus.PendingOrderConfirm)
                .PermitDynamicAsync(PurchaseRequestTrigger.ConfirmOrder,
                async () =>
                {
                    await _workflowService.ConfirmOrderAsync(_entity, "Đã xác nhận đơn hàng và nhập số lượng thực tế", default);
                    return PurchaseRequestStatus.Completed;
                });

            // _machine.Configure(PurchaseRequestStatus.Completed);
            // _machine.Configure(PurchaseRequestStatus.RejectedByDepartment);
            // _machine.Configure(PurchaseRequestStatus.RejectedByControl);
        }

    }

}
