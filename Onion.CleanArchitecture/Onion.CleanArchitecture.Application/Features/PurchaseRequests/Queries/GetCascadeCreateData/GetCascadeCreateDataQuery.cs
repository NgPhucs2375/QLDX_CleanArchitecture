using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetCascadeCreateData
{
    public class GetCascadeCreateDataQuery : IRequest<Response<CascadeCreateDataDto>>
    {
        public int ProposalConfigId { get; set; }
        public int DepartmentId { get; set; }
    }

    public class CascadeCategoryDto
    {
        public int ConfigCategoryId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal RemainingAmount { get; set; }
    }

    public class CascadeApproverDto
    {
        public string ApproverId { get; set; }
        public string Role { get; set; }
        public int StepOrder { get; set; }
    }

    public class CascadeCreateDataDto
    {
        public List<CascadeCategoryDto> Categories { get; set; }
        public List<CascadeApproverDto> Approvers { get; set; }
        public string DepartmentManagerId { get; set; }
    }

    public class GetCascadeCreateDataQueryHandler : IRequestHandler<GetCascadeCreateDataQuery, Response<CascadeCreateDataDto>>
    {
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepo;
        private readonly IConfigApproverRepositoryAsync _configApproverRepo;
        private readonly IDepartmentRepositoryAsync _departmentRepo;

        public GetCascadeCreateDataQueryHandler(
            IConfigCategoryRepositoryAsync configCategoryRepo,
            IConfigApproverRepositoryAsync configApproverRepo,
            IDepartmentRepositoryAsync departmentRepo)
        {
            _configCategoryRepo = configCategoryRepo;
            _configApproverRepo = configApproverRepo;
            _departmentRepo = departmentRepo;
        }

        public async Task<Response<CascadeCreateDataDto>> Handle(GetCascadeCreateDataQuery request, CancellationToken ct)
        {
            var configCategories = await _configCategoryRepo.GetByConfigAndDepartmentAsync(
                request.ProposalConfigId, request.DepartmentId);

            var configApprovers = await _configApproverRepo.GetByConfigAndDepartmentAsync(
                request.ProposalConfigId, request.DepartmentId);

            var department = await _departmentRepo.GetByIdAsync(request.DepartmentId);

            var dto = new CascadeCreateDataDto
            {
                Categories = configCategories.Select(cc => new CascadeCategoryDto
                {
                    ConfigCategoryId = cc.Id,
                    CategoryId = cc.CategoryId,
                    CategoryName = cc.Category?.Name ?? string.Empty,
                    AllowedQuota = cc.AllowedQuota,
                    RemainingAmount = cc.RemainingAmount,
                }).ToList(),

                Approvers = configApprovers.Select(ca => new CascadeApproverDto
                {
                    ApproverId = ca.ApproverId,
                    Role = ca.Level == ApprovalLevel.ControlLevel ? "Kiểm soát" : "Trưởng đơn vị",
                    StepOrder = ca.Level == ApprovalLevel.ControlLevel ? 2 : 1,
                }).ToList(),

                DepartmentManagerId = department?.ManagerId ?? string.Empty,
            };

            return new Response<CascadeCreateDataDto>(dto);
        }
    }
}
