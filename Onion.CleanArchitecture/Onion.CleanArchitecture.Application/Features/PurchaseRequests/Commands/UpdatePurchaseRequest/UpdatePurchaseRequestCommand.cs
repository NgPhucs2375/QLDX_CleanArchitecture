using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.UpdatePurchaseRequest
{
    public class UpdatePurchaseRequestItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int ProposedQuantity { get; set; }
        public string? Note { get; set; }
    }

    public class UpdatePurchaseRequestCategoryDto
    {
        public int CategoryId { get; set; }
        public List<UpdatePurchaseRequestItemDto> Items { get; set; } = new();
    }

    public class UpdatePurchaseRequestCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int ProposalConfigId { get; set; }
        public string? ApproverId { get; set; }
        public string? Reason { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? ShippingAddress { get; set; }
        public string? Note { get; set; }
        public List<UpdatePurchaseRequestCategoryDto> Categories { get; set; } = new();
    }

    public class UpdatePurchaseRequestCommandHandler : IRequestHandler<UpdatePurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepo;
        private readonly IPurchaseRequestCategoryRepositoryAsync _categoryRepo;
        private readonly IPurchaseRequestItemRepositoryAsync _itemRepo;
        private readonly IPurchaseRequestApproverRepositoryAsync _approverRepo;
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepo;
        private readonly IConfigApproverRepositoryAsync _configApproverRepo;
        private readonly IProductRepositoryAsync _productRepo;
        private readonly IUserLookupService _userLookup;
        private readonly IAuthenticatedUserService _authenticatedUser;
        private readonly IApprovalRecordService _approvalRecordService;
        private readonly ISagaInstanceRepository _sagaRepository;

        public UpdatePurchaseRequestCommandHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepo,
            IPurchaseRequestCategoryRepositoryAsync categoryRepo,
            IPurchaseRequestItemRepositoryAsync itemRepo,
            IPurchaseRequestApproverRepositoryAsync approverRepo,
            IConfigCategoryRepositoryAsync configCategoryRepo,
            IConfigApproverRepositoryAsync configApproverRepo,
            IProductRepositoryAsync productRepo,
            IUserLookupService userLookup,
            IAuthenticatedUserService authenticatedUser,
            IApprovalRecordService approvalRecordService,
            ISagaInstanceRepository sagaRepository
        )
        {
            _purchaseRequestRepo = purchaseRequestRepo;
            _categoryRepo = categoryRepo;
            _itemRepo = itemRepo;
            _approverRepo = approverRepo;
            _configCategoryRepo = configCategoryRepo;
            _configApproverRepo = configApproverRepo;
            _productRepo = productRepo;
            _userLookup = userLookup;
            _authenticatedUser = authenticatedUser;
            _approvalRecordService = approvalRecordService;
            _sagaRepository = sagaRepository;
        }

        public async Task<Response<int>> Handle(UpdatePurchaseRequestCommand request, CancellationToken cancellationToken)
        {
            var entity = await _purchaseRequestRepo.GetByIdWithDetailsAsync(request.Id);
            if (entity == null)
                throw new ApiException($"PurchaseRequest Not Found.");
            var sagaState = await _sagaRepository.GetCurrentStateByRequestIdAsync(request.Id);
            if (sagaState != null && sagaState != "ReturnedForEdit")
                throw new ApiException("Không thể chỉnh phiếu khi đã được submit.");

            var configCategories = await _configCategoryRepo.GetByConfigAndDepartmentAsync(
                request.ProposalConfigId, request.DepartmentId);
            var configCatMap = configCategories?
                .GroupBy(cc => cc.CategoryId)
                .ToDictionary(g => g.Key, g => g.First()) ?? new();

                // 1. Gom nhóm và loại bỏ các danh mục bị trùng lặp từ Frontend gửi lên
            var sanitizedCategories = request.Categories
                .GroupBy(c => c.CategoryId)
                .Select(g => new 
                {
                    CategoryId = g.Key,
                    // Gộp tất cả các Items của các Category trùng nhau lại (nếu có), và lọc trùng ProductId
                    Items = g.SelectMany(c => c.Items)
                            .GroupBy(i => i.ProductId)
                            .Select(ig => ig.First())
                            .ToList()
                })
                .ToList();

            var allProductIds = sanitizedCategories
                .SelectMany(c => c.Items)
                .Select(i => i.ProductId)
                .Distinct()
                .ToList();
            var snapshots = await _productRepo.GetSnapshotsAsync(allProductIds);
            var snapshotMap = snapshots
                .GroupBy(p => p.Id)
                .ToDictionary(g => g.Key, g => g.First());

            entity.Code = request.Code;
            entity.DepartmentId = request.DepartmentId;
            entity.ProposalConfigId = request.ProposalConfigId;
            entity.Reason = request.Reason;
            entity.ContactName = request.ContactName;
            entity.ContactPhone = request.ContactPhone;
            entity.ShippingAddress = request.ShippingAddress;
            entity.Note = request.Note;
            entity.TotalProposedAmount = 0;
            entity.TotalActualAmount = 0;

            foreach (var existingCat in entity.RequestCategories.ToList())
            {
                foreach (var existingItem in existingCat.RequestItems.ToList())
                    await _itemRepo.DeleteAsync(existingItem);
                await _categoryRepo.DeleteAsync(existingCat);
            }
            entity.RequestCategories.Clear(); 

            foreach (var approver in entity.Approvers.ToList())
            {
                await _approverRepo.DeleteAsync(approver);
            }
            entity.Approvers.Clear();

            foreach (var approver in entity.Approvers.ToList())
            {
                await _approverRepo.DeleteAsync(approver);
            }
            entity.Approvers.Clear();

            await _purchaseRequestRepo.UpdateAsync(entity);

            foreach (var catDto in sanitizedCategories)
                        {
                            if (!configCatMap.TryGetValue(catDto.CategoryId, out var configCat))
                                throw new ApiException($"CategoryId {catDto.CategoryId} không có trong cấu hình danh mục");

                            var requestCategory = new PurchaseRequestCategory
                            {
                                PurchaseRequestId = entity.Id,
                                CategoryId = catDto.CategoryId,
                                AllowedQuota = configCat.AllowedQuota,
                                TotalProposedAmount = 0,
                                Difference = configCat.AllowedQuota,
                                ActualTotalAmount = 0,
                                ActualDifference = 0,
                            };

                            foreach (var itemDto in catDto.Items)
                            {
                                if (!snapshotMap.TryGetValue(itemDto.ProductId, out var snapshot))
                                    throw new ApiException($"Sản phẩm {itemDto.ProductId} không tồn tại");

                                var lineTotal = snapshot.UnitPrice * itemDto.ProposedQuantity;

                                requestCategory.RequestItems.Add(new PurchaseRequestItem
                                {
                                    ProductId = itemDto.ProductId,
                                    ProductCode = snapshot.Code ?? string.Empty,
                                    ProductName = snapshot.Name ?? string.Empty,
                                    ProductUnit = snapshot.Unit ?? string.Empty,
                                    UnitPrice = snapshot.UnitPrice,
                                    ProposedQuantity = itemDto.ProposedQuantity,
                                    TotalAmount = lineTotal,
                                    ActualQuantity = 0,
                                    ActualTotalAmount = 0,
                                });

                                requestCategory.TotalProposedAmount += lineTotal;
                            }

                            requestCategory.Difference = requestCategory.AllowedQuota - requestCategory.TotalProposedAmount;
                            entity.TotalProposedAmount += requestCategory.TotalProposedAmount; // Cộng dồn tiền vào phiếu gốc
                            
                            // Dùng repo riêng để Insert
                            await _categoryRepo.AddAsync(requestCategory);
                        }
            if (!string.IsNullOrEmpty(request.ApproverId))
                        {
                            var deptHeadName = await _userLookup.GetDisplayNameAsync(request.ApproverId);
                            await _approverRepo.AddAsync(new PurchaseRequestApprover
                            {
                                PurchaseRequestId = entity.Id,
                                ApproverId = request.ApproverId,
                                ApproverName = deptHeadName,
                                Role = PDXROLE.TruongDonVi,
                                StepOrder = (int)ApprovalLevel.DepartmentLevel,
                            });
                        }

                        var configApprovers = await _configApproverRepo.GetByConfigAndDepartmentAsync(
                            request.ProposalConfigId, request.DepartmentId);
                            
                        foreach (var ca in configApprovers.Where(ca => ca.Level == ApprovalLevel.ControlLevel))
                        {
                            var controlName = await _userLookup.GetDisplayNameAsync(ca.ApproverId);
                            await _approverRepo.AddAsync(new PurchaseRequestApprover
                            {
                                PurchaseRequestId = entity.Id,
                                ApproverId = ca.ApproverId,
                                ApproverName = controlName,
                                Role = PDXROLE.KiemSoat,
                                StepOrder = (int)ApprovalLevel.ControlLevel,
                            });
                        }

                        if (!string.IsNullOrEmpty(entity.CreatedBy))
                        {
                            var creatorName = await _userLookup.GetDisplayNameAsync(entity.CreatedBy);
                            await _approverRepo.AddAsync(new PurchaseRequestApprover
                            {
                                PurchaseRequestId = entity.Id,
                                ApproverId = entity.CreatedBy,
                                ApproverName = creatorName,
                                Role = PDXROLE.NguoiTaoPDX,
                                StepOrder = (int)ApprovalLevel.CreatorLevel,
                            });
                        }
            await _purchaseRequestRepo.UpdateAsync(entity);

            // Ghi lịch sử cập nhật phiếu
            var statusBefore = sagaState;
            await _approvalRecordService.RecordAsync(
                entity,
                PurchaseRequestTrigger.Update,
                request.Note ?? "Cập nhật thông tin phiếu đề xuất",
                cancellationToken
            );

            return new Response<int>(entity.Id);
        }
    }
}