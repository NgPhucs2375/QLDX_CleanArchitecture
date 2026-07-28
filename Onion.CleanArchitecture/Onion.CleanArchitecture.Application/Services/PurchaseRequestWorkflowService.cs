using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MassTransit;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Application.Services
{
    public interface IPurchaseRequestWorkflowService
    {
        Task<PurchaseRequest> SubmitAsync(PurchaseRequest entity, string note, CancellationToken ct);
        Task<PurchaseRequest> ApproveByDepartmentAsync(PurchaseRequest entity, string note, CancellationToken ct);
        Task<PurchaseRequest> RejectedByDepartmentAsync(PurchaseRequest entity, string note, CancellationToken ct);
        Task<PurchaseRequest> ApproveByControlAsync(PurchaseRequest entity, string note, CancellationToken ct);
        Task<PurchaseRequest> RejectedByControlAsync(PurchaseRequest entity, string note, CancellationToken ct);
        Task<PurchaseRequest> ReturnForEditByControlAsync(PurchaseRequest entity, string note, CancellationToken ct);
        Task<PurchaseRequest> ConfirmOrderAsync(PurchaseRequest entity, string note, CancellationToken ct);

        // Guards — được state machine gọi TRƯỚC khi fire trigger
        Task ValidateApproverForCurrentStep(PurchaseRequest entity);
    }
    public class PurchaseRequestWorkflowService :IPurchaseRequestWorkflowService
    {
        private readonly IPurchaseRequestRepositoryAsync _repository;
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepo;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IProductRepositoryAsync _productRepository;
        private readonly ILogger<PurchaseRequestWorkflowService> _logger;
        private readonly IDepartmentRepositoryAsync _departmentRepo;
        private readonly IUserLookupService _userLookup;
        private readonly IEventBusService _eventBusService;



        public PurchaseRequestWorkflowService(
            IPurchaseRequestRepositoryAsync repository,
            IConfigCategoryRepositoryAsync configCategoryRepo,
            IAuthenticatedUserService authenticatedUser,
            IProductRepositoryAsync productRepository,
            ILogger<PurchaseRequestWorkflowService> logger,
            IDepartmentRepositoryAsync departmentRepo,
            IUserLookupService userLookup,
            IEventBusService eventBusService)
        {
            _repository = repository;
            _configCategoryRepo = configCategoryRepo;
            _authenticatedUser = authenticatedUser;
            _productRepository = productRepository;
            _logger = logger;
            _departmentRepo = departmentRepo;
            _userLookup = userLookup;
            _eventBusService = eventBusService;
        }

    // +++++++++++++++++++=++++++++++ Cac Ham validate du lieu truoc khi submit, approve, reject ++++++++++++++++++++++++++++
        // ValidateQuotaOnSubmitAsync: Kiểm tra định mức tiền khi submit
        // ValidateApproverForCurrentStep: Kiểm tra quyền phê duyệt cho bước hiện tại
        // ValidateDataOnSubmitAsync: Kiểm tra dữ liệu trước khi submit
        // ValidateConfirmOrderAsync: Kiểm tra dữ liệu trước khi xác nhận đơn hàng

        public async Task ValidateQuotaOnSubmitAsync(PurchaseRequest entity, CancellationToken ct)
        {
            var configCategories = await _configCategoryRepo.GetByConfigAndDepartmentAsync(
                entity.ProposalConfigId, entity.DepartmentId);

            foreach (var category in entity.RequestCategories)
            {
                var categoryTotalProposed = category.RequestItems.Sum(i => i.UnitPrice * i.ProposedQuantity);
                var configCat = configCategories.FirstOrDefault(cc => cc.CategoryId == category.CategoryId);
                var allowedQuota = configCat?.AllowedQuota ?? 0;

                if (categoryTotalProposed > allowedQuota)
                {
                    throw new ApiException(
                        $"Danh mục vượt định mức. Đề xuất: {categoryTotalProposed:N0}, Cho phép: {allowedQuota:N0}");
                }

                category.AllowedQuota = allowedQuota;
                category.TotalProposedAmount = categoryTotalProposed;
                category.Difference = allowedQuota - categoryTotalProposed;
            }
        }

        public async Task ValidateApproverForCurrentStep(PurchaseRequest entity)
{
    var currentUserId = _authenticatedUser.UserId;
    if (string.IsNullOrEmpty(currentUserId))
        throw new ApiException("Không xác định được người dùng hiện tại.");

    if (string.Equals(currentUserId, entity.CreatedBy, StringComparison.OrdinalIgnoreCase))
        throw new ApiException("Người tạo phiếu không được phép thực hiện thao tác trên chính phiếu mình tạo !");

    int requiredStep = entity.Status switch
    {
        PurchaseRequestStatus.PendingDepartment => 1,
        PurchaseRequestStatus.PendingControl => 2,
        _ => throw new ApiException($"Không có bước phê duyệt cho trạng thái {entity.Status}")
    };

    // Normalize to Guid for consistent comparison
    Guid.TryParse(currentUserId?.Trim(), out var userGuid);

    _logger.LogInformation(
        "ValidateApproverForCurrentStep DEBUG - CurrentUserId: '{UserId}' (len={Len}), Step: {Step}, ApproverCount: {Count}",
        currentUserId, currentUserId?.Length, requiredStep, entity.Approvers?.Count);
    foreach (var a in entity.Approvers.Where(x => x.StepOrder == requiredStep))
    {
        _logger.LogInformation(
            "  Approver[Step={Step}]: Id='{ApproverId}' (len={Len}), IsGuid={IsGuid}",
            a.StepOrder, a.ApproverId, a.ApproverId?.Length, Guid.TryParse(a.ApproverId?.Trim(), out _));
    }

    var isApprover = entity.Approvers.Any(a =>
        a.StepOrder == requiredStep &&
        (
            string.Equals(a.ApproverId?.Trim(), currentUserId?.Trim(), StringComparison.OrdinalIgnoreCase) ||
            (userGuid != Guid.Empty && Guid.TryParse(a.ApproverId?.Trim(), out var approverGuid) && approverGuid == userGuid)
        )
    );

    // 2. Fallback: CHỈ ÁP DỤNG CHO BƯỚC 1 (Trưởng đơn vị)
    if (!isApprover && requiredStep == 1) 
    {
        var department = await _departmentRepo.GetByIdAsync(entity.DepartmentId);
        if (department != null)
        {
            isApprover = string.Equals(department.ManagerId?.Trim(), currentUserId?.Trim(), StringComparison.OrdinalIgnoreCase);
        }
    }

    if (!isApprover)
    {
        _logger.LogWarning(
            "ValidateApproverForCurrentStep FAILED - UserId: {UserId}, Status: {Status}, RequiredStep: {Step}, Approvers: {Approvers}",
            currentUserId, entity.Status, requiredStep,
            entity.Approvers?.Select(a => new { a.StepOrder, a.ApproverId }));
        throw new ApiException("Bạn không phải là người phê duyệt cho bước này.");
    }
}       

 public async Task ValidateDataOnSubmitAsync(PurchaseRequest entity)
        {
            if (entity.RequestCategories == null || !entity.RequestCategories.Any())
            {
                throw new ApiException("Phiếu đề xuất mua hàng phải có ít nhất 1 danh mục sản phẩm.");
            }

            var configCategories = await _configCategoryRepo.GetByConfigAndDepartmentAsync(
                entity.ProposalConfigId, entity.DepartmentId);
            // Select List Cau hinh hop le thuoc danh muc duoc phep de submit
            var validCategoryIds = configCategories.Select(c =>c.CategoryId).ToList();
            foreach (var category in entity.RequestCategories)
            {
                if (!validCategoryIds.Contains(category.CategoryId))
                {
                    throw new ApiException($"Danh mục '{category.CategoryId}' không hợp lệ hoặc không được phép trong cấu hình này.");
                }
            }

            // 
            var allProductIds = entity.RequestCategories 
                .SelectMany(c => c.RequestItems) // Lay nhieu san pham thuoc PurchaseRequestCategory
                .Select(i => i.ProductId) // Lay 
                .Distinct() // ton tai : 
                .ToList(); // List

        var productsInDb = await _productRepository.GetSnapshotsAsync(allProductIds); 
        var productDict = productsInDb.ToDictionary(p => p.Id);
        foreach (var category in entity.RequestCategories)
    {
        // 1. Kiểm tra danh mục có nằm trong cấu hình không
        if (!validCategoryIds.Contains(category.CategoryId))
        {
            throw new ApiException($"Danh mục ID {category.CategoryId} không nằm trong cấu hình đề xuất đã chọn.");
        }

        // 2. Kiểm tra danh mục có rỗng không
        if (category.RequestItems == null || !category.RequestItems.Any())
        {
            throw new ApiException($"Danh mục ID {category.CategoryId} không có sản phẩm nào. Không được phép submit phiếu rỗng.");
        }

        // 3. Lặp qua từng sản phẩm bên trong danh mục đó
        foreach (var item in category.RequestItems)
        {
            if (!productDict.TryGetValue(item.ProductId, out var productDb))
            {
                throw new ApiException($"Sản phẩm với ID {item.ProductId} không tồn tại trong hệ thống.");
            }

            //// 3.1 Sản phẩm phải thuộc danh mục đã chọn
            // if (productDb.CategoryId != category.CategoryId)
            // {
            //     throw new ApiException($"Sản phẩm '{productDb.Name}' không thuộc danh mục ID {category.CategoryId}.");
            // }

            // // 3.2 Sản phẩm phải đang hoạt động
            // // LƯU Ý CHO LỖI "ProductStatus does not exist": 
            // // - Nhấn Ctrl + . vào ProductStatus để using namespace chứa Enum này.
            // // - Nếu Entity Product của bạn không dùng Enum này, hãy đổi lại thành trạng thái thực tế của bạn (VD: productDb.IsActive == false)
            // if (productDb.Status != ProductStatus.Active) 
            // {
            //     throw new ApiException($"Sản phẩm '{productDb.Name}' đang không ở trạng thái hoạt động (Active).");
            // }
        }
    }
}
    
        public async Task ValidateConfirmOrderAsync(PurchaseRequest entity,CancellationToken ct)
        {
            // 1. VALIDATE QUYỀN: Người bấm nút (nhập số lượng) PHẢI LÀ Người tạo phiếu
            if (_authenticatedUser.UserId != entity.CreatedBy)
            {
                throw new ApiException("Chỉ nhân sự tạo đề xuất mới được quyền xác nhận và nhập số lượng thực tế.");
            }

            // 2. VALIDATE SỐ LƯỢNG: Đảm bảo người dùng nhập dữ liệu hợp lệ trên Modal
            foreach (var category in entity.RequestCategories)
            {
                foreach (var item in category.RequestItems)
                {
                    // Kiểm tra số lượng thực tế nhập vào không được phép âm
                    if (item.ActualQuantity < 0)
                    {
                        throw new ApiException($"Số lượng thực tế của sản phẩm '{item.ProductName}' không được là số âm.");
                    }
                }
            }
        }
    // ++++++++++++++++++++++++++++ Cac Service chuyen dung cho workflow ++++++++++++++++++++++++++++
        // SubmitAsync: Dùng cho người tạo phiếu để submit
        // ApproveByDepartmentAsync: Dùng cho trưởng đơn vị phê duyệt
        // RejectedByDepartmentAsync: Dùng cho trưởng đơn vị từ chối
        // ApproveByControlAsync: Dùng cho cấp kiểm soát phê duyệt
        // RejectedByControlAsync: Dùng cho cấp kiểm soát từ chối
        // ReturnForEditByControlAsync: Dùng cho cấp kiểm soát yêu cầu sửa đổi
        // ConfirmOrderAsync: Dùng cho người tạo phiếu xác nhận đơn hàng và nhập số lượng thực tế
    private void UpdateApproverStatus(PurchaseRequest entity, int stepOrderFrom, int stepOrderTo, ApproverStatus newStatus)
    {
        foreach (var approver in entity.Approvers)
        {
            if (approver.StepOrder == stepOrderFrom)
                approver.Status = newStatus;
            if (approver.StepOrder == stepOrderTo)
                approver.Status = ApproverStatus.Pending;
        }
    }

    public async Task<PurchaseRequest> SubmitAsync(PurchaseRequest entity, string note, CancellationToken ct)
    {
        await ValidateQuotaOnSubmitAsync(entity, ct);
        UpdateApproverStatus(entity, (int)ApprovalLevel.CreatorLevel, (int)ApprovalLevel.DepartmentLevel, ApproverStatus.Approved);
        await _eventBusService.PublishAsync(
            new PurchaseRequestSubmittedEvent(
                CorrelationId: NewId.NextGuid(),
                RequestId: entity.Id,
                TotalAmount: entity.TotalProposedAmount,
                SubmittedBy: _authenticatedUser.UserId,
                OccurredAt: DateTime.UtcNow
            ),ct
        );
        return entity;
    }
    public async Task<PurchaseRequest> ApproveByDepartmentAsync(PurchaseRequest entity,string note, CancellationToken ct){
        UpdateApproverStatus(entity, (int)ApprovalLevel.DepartmentLevel, (int)ApprovalLevel.ControlLevel, ApproverStatus.Approved);
        await _eventBusService.PublishAsync(
            new PurchaseRequestDepartmentApprovedEvent(
                CorrelationId: NewId.NextGuid(),
                RequestId: entity.Id,
                ApprovedBy: _authenticatedUser.UserId,
                ApprovedAt: DateTime.UtcNow,
                Note: note
            ),ct
        );
        return entity;
        }
    public async Task<PurchaseRequest> RejectedByDepartmentAsync(PurchaseRequest entity,string note,CancellationToken ct)
        {
            if(string.IsNullOrEmpty(note))
            {
                throw new ApiException("Lý do từ chối không được để trống.");
            }
            foreach (var approver in entity.Approvers.Where(a => a.StepOrder == (int)ApprovalLevel.DepartmentLevel))
                approver.Status = ApproverStatus.Rejected;

            await _eventBusService.PublishAsync(
                new PurchaseRequestDepartmentRejectedEvent(
                    CorrelationId: NewId.NextGuid(),
                    RequestId: entity.Id,
                    RejectedBy: _authenticatedUser.UserId,
                    Note: note,
                    OccurredAt: DateTime.UtcNow
                ),ct
            );
            return entity;
        }
    public async Task<PurchaseRequest> ApproveByControlAsync(PurchaseRequest entity,string note,CancellationToken ct)
    {
        foreach (var approver in entity.Approvers.Where(a => a.StepOrder == (int)ApprovalLevel.ControlLevel))
            approver.Status = ApproverStatus.Approved;
        await _eventBusService.PublishAsync(
            new PurchaseRequestControlApprovedEvent(
                CorrelationId: NewId.NextGuid(),
                RequestId: entity.Id,
                ApprovedBy: _authenticatedUser.UserId,
                Note: note,
                OccurredAt: DateTime.UtcNow
            ),ct
        );
        return entity;
        }    
    public async Task<PurchaseRequest> RejectedByControlAsync(PurchaseRequest entity,string note,CancellationToken ct)
        {
            if(string.IsNullOrEmpty(note))
            {
                throw new ApiException("Lý do từ chối không được để trống.");
            }
            foreach (var approver in entity.Approvers.Where(a => a.StepOrder == (int)ApprovalLevel.ControlLevel))
                approver.Status = ApproverStatus.Rejected;
            await _eventBusService.PublishAsync(
                new PurchaseRequestControlRejectedEvent(
                    CorrelationId: NewId.NextGuid(),
                    RequestId: entity.Id,
                    RejectedBy: _authenticatedUser.UserId,
                    Note: note,
                    OccurredAt: DateTime.UtcNow
                ),ct
            );
            return entity;
        }
    public async Task<PurchaseRequest> ReturnForEditByControlAsync(PurchaseRequest entity,string note,CancellationToken ct)
        {
            if(string.IsNullOrEmpty(note))
            {
                throw new ApiException("Lý do từ chối không được để trống.");
            }
            foreach (var approver in entity.Approvers.Where(a => a.StepOrder == (int)ApprovalLevel.ControlLevel))
                approver.Status = ApproverStatus.Bypassed;
            await _eventBusService.PublishAsync(
                new PurchaseRequestReturnedForEditEvent(
                    CorrelationId: NewId.NextGuid(),
                    RequestId: entity.Id,
                    ReturnedBy: _authenticatedUser.UserId,
                    ReturnAt: DateTime.UtcNow,
                    TotalAmount: entity.TotalProposedAmount,
                    SubmittedBy: entity.CreatedBy,
                    Note: note
                ),ct
            );
            return entity;
        }
    public async Task<PurchaseRequest> ConfirmOrderAsync(PurchaseRequest entity,string note,CancellationToken ct)
        {
            await ValidateConfirmOrderAsync(entity, ct);
            await _eventBusService.PublishAsync(
                new PurchaseRequestOrderConfirmedEvent(
                    CorrelationId: NewId.NextGuid(),
                    RequestId: entity.Id,
                    ConfirmedBy: _authenticatedUser.UserId,
                    ConfirmedAt: DateTime.UtcNow,
                    TotalAmount: entity.TotalProposedAmount,
                    SubmittedBy: entity.CreatedBy
                ),ct
            );
            return entity;
        }
    }
}
