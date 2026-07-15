using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
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
        public List<CreatePurchaseRequestCategoryDto> Categories { get; set; } = new();
    }

    public class CreatePurchaseRequestCommandHandler : IRequestHandler<CreatePurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepo;
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepo;
        private readonly IProductRepositoryAsync _productRepo;
        private readonly IConfigApproverRepositoryAsync _configApproverRepo;
        private readonly IDepartmentRepositoryAsync _departmentRepo;

        public CreatePurchaseRequestCommandHandler(
            IPurchaseRequestRepositoryAsync purchaseRequestRepo,
            IConfigCategoryRepositoryAsync configCategoryRepo,
            IProductRepositoryAsync productRepo,
            IConfigApproverRepositoryAsync configApproverRepo,
            IDepartmentRepositoryAsync departmentRepo)
        {
            _purchaseRequestRepo = purchaseRequestRepo;
            _configCategoryRepo = configCategoryRepo;
            _productRepo = productRepo;
            _configApproverRepo = configApproverRepo;
            _departmentRepo = departmentRepo;
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestCommand request, CancellationToken ct)
        {
            // 1. Load config categories for validation + quota snapshot
            var configCategories = await _configCategoryRepo.GetByConfigAndDepartmentAsync(
                request.ProposalConfigId, request.DepartmentId);

            // 2. Load all products referenced in the request
            var allProductIds = request.Categories
                .SelectMany(c => c.Items)
                .Select(i => i.ProductId)
                .Distinct()
                .ToList();

            var products = await _productRepo.GetByIdsAsync(allProductIds);
            var productMap = products.ToDictionary(p => p.Id);

            // 3. Load approver config for snapshot
            var configApprovers = await _configApproverRepo.GetByConfigAndDepartmentAsync(
                request.ProposalConfigId, request.DepartmentId);

            var department = await _departmentRepo.GetByIdAsync(request.DepartmentId);

            // 4. Build the PurchaseRequest graph
            var entity = new PurchaseRequest
            {
                Code = request.Code,
                DepartmentId = request.DepartmentId,
                ProposalConfigId = request.ProposalConfigId,
                Status = PurchaseRequestStatus.Draft,
                TotalProposedAmount = 0,
                TotalActualAmount = 0,
            };

            decimal overallProposed = 0;

            foreach (var catDto in request.Categories)
            {
                var configCat = configCategories.FirstOrDefault(cc => cc.CategoryId == catDto.CategoryId);
                var quota = configCat?.AllowedQuota ?? 0;

                var requestCategory = new PurchaseRequestCategory
                {
                    CategoryId = catDto.CategoryId,
                    AllowedQuota = quota,
                    TotalProposedAmount = 0,
                    Difference = 0,
                    ActualTotalAmount = 0,
                    ActualDifference = 0,
                };

                foreach (var itemDto in catDto.Items)
                {
                    if (!productMap.TryGetValue(itemDto.ProductId, out var product))
                        throw new ApiException($"Product {itemDto.ProductId} not found");

                    var totalAmount = product.UnitPrice * itemDto.ProposedQuantity;

                    requestCategory.RequestItems.Add(new PurchaseRequestItem
                    {
                        ProductId = itemDto.ProductId,
                        UnitPrice = product.UnitPrice,
                        ProposedQuantity = itemDto.ProposedQuantity,
                        TotalAmount = totalAmount,
                        ActualQuantity = 0,
                        ActualTotalAmount = 0,
                    });

                    requestCategory.TotalProposedAmount += totalAmount;
                }

                requestCategory.Difference = requestCategory.AllowedQuota - requestCategory.TotalProposedAmount;
                overallProposed += requestCategory.TotalProposedAmount;
                entity.RequestCategories.Add(requestCategory);
            }

            entity.TotalProposedAmount = overallProposed;

            // 5. Snapshot approvers
            // Department head (step 1)
            if (department?.ManagerId != null)
            {
                entity.Approvers.Add(new PurchaseRequestApprover
                {
                    ApproverId = department.ManagerId ?? string.Empty,
                    ApproverName = string.Empty,
                    Role = "Trưởng đơn vị",
                    StepOrder = 1,
                });
            }

            // Config approvers (step 2+)
            foreach (var ca in configApprovers)
            {
                entity.Approvers.Add(new PurchaseRequestApprover
                {
                    ApproverId = ca.ApproverId,
                    ApproverName = string.Empty,
                    Role = ca.Level == ApprovalLevel.ControlLevel ? "Kiểm soát" : "Trưởng đơn vị",
                    StepOrder = ca.Level == ApprovalLevel.ControlLevel ? 2 : 1,
                });
            }

            // 6. Save — EF Core cascade saves all children
            await _purchaseRequestRepo.AddAsync(entity);

            return new Response<int>(entity.Id);
        }
    }
}
