using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
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


            // 5. Build PurchaseRequest graph
            var entity = new PurchaseRequest
            {
                Code = request.Code,
                DepartmentId = request.DepartmentId,
                ProposalConfigId = request.ProposalConfigId,
                Status = PurchaseRequestStatus.Draft,
                TotalProposedAmount = 0,
                TotalActualAmount = 0,
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

            // 6. Thêm Trưởng đơn vị làm người phê duyệt đầu tiên
            //    Nếu request có ApproverId thì dùng, fallback về department.ManagerId
            //    Kiểm soát (ControlLevel) sẽ được thêm ở bước duyệt sau
            //    Người tạo phiếu được ghi nhận qua AuditableBaseEntity.CreatedBy
            var deptHeadId = !string.IsNullOrEmpty(request.ApproverId) ? request.ApproverId : department.ManagerId;
            if (!string.IsNullOrEmpty(deptHeadId))
            {
                var deptHeadName = await _userLookup.GetDisplayNameAsync(deptHeadId);
                entity.Approvers.Add(new PurchaseRequestApprover
                {
                    ApproverId = deptHeadId,
                    ApproverName = deptHeadName,
                    Role = PDXROLE.TruongDonVi,
                    StepOrder = (int)ApprovalLevel.DepartmentLevel,
                });
            }

            // --- BƯỚC 6.2: Khảm cấp Kiểm soát (Step 2) ---
            // Lọc ra những người thuộc cấp Kiểm soát trong cấu hình
            var controlApprovers = configApprovers
                .Where(ca => ca.Level == ApprovalLevel.ControlLevel)
                .ToList();

            foreach (var ca in controlApprovers)
            {
                // Snapshot tên cho từng người kiểm soát
                var controlName = await _userLookup.GetDisplayNameAsync(ca.ApproverId);
                
                entity.Approvers.Add(new PurchaseRequestApprover
                {
                    ApproverId = ca.ApproverId,
                    ApproverName = controlName, // Snapshot 
                    Role = PDXROLE.KiemSoat,
                    StepOrder = (int)ApprovalLevel.ControlLevel, 
                });
            }

            // --- BƯỚC 6.3: Khảm cấp Người tạo phiếu (Step 3) ---
            entity.CreatedBy = _authenticatesUser.UserId;
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

            // 
            var machine = new PurchaseRequestStateMachine(_workflowService, entity);
            await machine.FireAsync(PurchaseRequestTrigger.Submit);
            // 7. Save
            await _purchaseRequestRepo.AddAsync(entity);
            await _approvalRecordService.RecordAsync(
                entity, // dl 
                PurchaseRequestStatus.Draft, // status before
                PurchaseRequestTrigger.Submit, // trigger
                "Khởi tạo và trình duyệt phiếu", // Bạn có thể truyền Note từ request.Note
                ct //cancellationToken
            );  

            return new Response<int>(entity.Id);
        }
    }
}
