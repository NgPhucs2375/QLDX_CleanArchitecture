using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest
{
    public class CreatePurchaseRequestItemDto
    {
        public int ProductId { get; set; }
        public int ProposedQuantity { get; set; }
    }

    public class CreatePurchaseRequestCategoryDto
    {
        public int CategoryId { get; set; }
        public List<CreatePurchaseRequestItemDto> Items { get; set; } = new();
    }

    public class CreatePurchaseRequestCommand : IRequest<Response<int>>
    {
        public string Code { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int ProposalConfigId { get; set; }
        public string ApproverId { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? ShippingAddress { get; set; }
        public List<CreatePurchaseRequestCategoryDto> Categories { get; set; } = new();
    }

    public class CreatePurchaseRequestCommandHandler : IRequestHandler<CreatePurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepo;
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepo;
        private readonly IProductRepositoryAsync _productRepo;
        private readonly IConfigApproverRepositoryAsync _configApproverRepo;
        private readonly IDepartmentRepositoryAsync _departmentRepo;
        private readonly IUserLookupService _userLookup;
        private readonly IPurchaseRequestWorkflowService  _workflowService;
        private readonly IAuthenticatedUserService _authenticatesUser;
        private readonly IApprovalRecordService _approvalRecordService;



        public CreatePurchaseRequestCommandHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepo,
            IConfigCategoryRepositoryAsync configCategoryRepo,
            IProductRepositoryAsync productRepo,
            IConfigApproverRepositoryAsync configApproverRepo,
            IDepartmentRepositoryAsync departmentRepo,
            IUserLookupService userLookup,
            IPurchaseRequestWorkflowService workflowService,
            IAuthenticatedUserService authenticatesUser,
            IApprovalRecordService approvalRecordService
            )
        {
            _purchaseRequestRepo = purchaseRequestRepo;
            _configCategoryRepo = configCategoryRepo;
            _productRepo = productRepo;
            _configApproverRepo = configApproverRepo;
            _departmentRepo = departmentRepo;
            _userLookup = userLookup;
            _workflowService = workflowService;
            _authenticatesUser = authenticatesUser;
            _approvalRecordService = approvalRecordService;  
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestCommand request, CancellationToken ct)
        {


            // 1. Validate department tồn tại
            var department = await _departmentRepo.GetByIdAsync(request.DepartmentId);
            if (department == null)
                throw new ApiException($"Department {request.DepartmentId} không tồn tại");

            // 2. Load & validate config categories — phải có dữ liệu
            var configCategories = await _configCategoryRepo.GetByConfigAndDepartmentAsync(
                request.ProposalConfigId, request.DepartmentId);
            if (configCategories == null || configCategories.Count == 0)
                throw new ApiException($"Không tìm thấy cấu hình danh mục cho ProposalConfigId={request.ProposalConfigId}, DepartmentId={request.DepartmentId}");

            // 3. Validate + snapshot thông tin sản phẩm (1 query duy nhất)
            var allProductIds = request.Categories
                .SelectMany(c => c.Items)
                .Select(i => i.ProductId)
                .Distinct()
                .ToList();

            var productSnapshots = await _productRepo.GetSnapshotsAsync(allProductIds);
            var snapshotMap = productSnapshots.ToDictionary(p => p.Id);

            var missingIds = allProductIds.Where(id => !snapshotMap.ContainsKey(id)).ToList();
            if (missingIds.Any())
                throw new ApiException($"Sản phẩm không tồn tại: {string.Join(", ", missingIds)}");


            // 4. Load cấu hình người duyệt từ DB
            var configApprovers = await _configApproverRepo.GetByConfigAndDepartmentAsync(
            request.ProposalConfigId, request.DepartmentId);
            Console.WriteLine($"[CreatePR] ConfigApprovers count: {configApprovers?.Count ?? 0}");
            foreach (var ca in configApprovers ?? new())
            {
                Console.WriteLine($"[CreatePR]   ca.Id={ca.Id}, ca.ProposalConfigId={ca.ProposalConfigId}, ca.DepartmentId={ca.DepartmentId}, ca.Level={ca.Level}, ca.ApproverId={ca.ApproverId}");
            }


            // 5. Build PurchaseRequest graph
            var entity = new PurchaseRequest
            {
                Code = request.Code,
                DepartmentId = request.DepartmentId,
                ProposalConfigId = request.ProposalConfigId,
                Status = PurchaseRequestStatus.Draft,
                TotalProposedAmount = 0,
                TotalActualAmount = 0,
                Reason = request.Reason,
                ContactName = request.ContactName,
                ContactPhone = request.ContactPhone,
                ShippingAddress = request.ShippingAddress,
                Note = request.Note,
            };

            foreach (var catDto in request.Categories)
            {
                var configCat = configCategories.FirstOrDefault(cc => cc.CategoryId == catDto.CategoryId)
                    ?? throw new ApiException($"CategoryId {catDto.CategoryId} không có trong cấu hình danh mục");

                var requestCategory = new PurchaseRequestCategory
                {
                    CategoryId = catDto.CategoryId,
                    AllowedQuota = configCat.AllowedQuota,
                    TotalProposedAmount = 0,
                    Difference = configCat.AllowedQuota,
                    ActualTotalAmount = 0,
                    ActualDifference = 0,
                };

                foreach (var itemDto in catDto.Items)
                {
                    var snapshot = snapshotMap.GetValueOrDefault(itemDto.ProductId);
                    var snapPrice = snapshot?.UnitPrice ?? 0;
                    var lineTotal = snapPrice * itemDto.ProposedQuantity;

                    requestCategory.RequestItems.Add(new PurchaseRequestItem
                    {
                        ProductId = itemDto.ProductId,
                        ProductCode = snapshot?.Code ?? string.Empty,
                        ProductName = snapshot?.Name ?? string.Empty,
                        ProductUnit = snapshot?.Unit ?? string.Empty,
                        UnitPrice = snapPrice,
                        ProposedQuantity = itemDto.ProposedQuantity,
                        TotalAmount = lineTotal,
                        ActualQuantity = 0,
                        ActualTotalAmount = 0,
                    });

                    requestCategory.TotalProposedAmount += lineTotal;
                }

                requestCategory.Difference = requestCategory.AllowedQuota - requestCategory.TotalProposedAmount;
                entity.TotalProposedAmount += requestCategory.TotalProposedAmount;
                entity.RequestCategories.Add(requestCategory);
            }

            // 6. Set creator early
            entity.CreatedBy = _authenticatesUser.UserId;

            // 7. Thêm Trưởng đơn vị làm người phê duyệt đầu tiên (từ Department.ManagerId)
            if (string.IsNullOrEmpty(request.ApproverId))
            {
                throw new ApiException("Vui lòng chọn người duyệt cấp đơn vị.");
            }

            var deptHeadId = request.ApproverId;
            var deptHeadName = await _userLookup.GetDisplayNameAsync(deptHeadId);

            entity.Approvers.Add(new PurchaseRequestApprover
            {
                ApproverId = deptHeadId,
                ApproverName = deptHeadName,
                Role = PDXROLE.TruongDonVi,
                StepOrder = (int)ApprovalLevel.DepartmentLevel,
            });

            // ---  Kiểm soát (Step 2) — chỉ lấy ControlLevel từ ConfigApprover ---
            var controlApprovers = configApprovers
                .Where(ca => ca.Level == ApprovalLevel.ControlLevel)
                .ToList();
            Console.WriteLine($"[CreatePR] ControlApprovers count: {controlApprovers.Count} (after filter Level=={(int)ApprovalLevel.ControlLevel})");
            foreach (var ca in controlApprovers)
            {
                Console.WriteLine($"[CreatePR]   Control ca.Id={ca.Id}, ca.ApproverId={ca.ApproverId}");
            }

            foreach (var ca in controlApprovers)
            {
                var controlName = await _userLookup.GetDisplayNameAsync(ca.ApproverId);

                entity.Approvers.Add(new PurchaseRequestApprover
                {
                    ApproverId = ca.ApproverId,
                    ApproverName = controlName,
                    Role = PDXROLE.KiemSoat,
                    StepOrder = (int)ApprovalLevel.ControlLevel,
                });
            }

            // --- Người tạo phiếu (Step 3) ---
            if (!string.IsNullOrEmpty(entity.CreatedBy))
            {
                var creatorName = await _userLookup.GetDisplayNameAsync(entity.CreatedBy);
                entity.Approvers.Add(new PurchaseRequestApprover
                {
                    ApproverId = entity.CreatedBy,
                    ApproverName = creatorName,
                    Role = PDXROLE.NguoiTaoPDX,
                    StepOrder = (int)ApprovalLevel.CreatorLevel,
                });
            }
            // 7. Save entity trước để có ID — OnEntryAsync cần ID để ghi ApprovalRecord
            await _purchaseRequestRepo.AddAsync(entity);

            // 8. Fire state machine: Draft → PendingDepartment (kèm ghi lịch sử tự động qua OnEntry)
            var machine = new PurchaseRequestStateMachine(_workflowService, _approvalRecordService, entity, _authenticatesUser.UserId);
            await machine.FireAsync(PurchaseRequestTrigger.Submit, request.Note, ct);

            // 9. Update entity sau khi state machine thay đổi Status + ApproverStatus
            await _purchaseRequestRepo.UpdateAsync(entity);

            return new Response<int>(entity.Id);
        }
    }
}
