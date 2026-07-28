using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.WebApp.Server.Services
{
    public class CompositeApproverRoutingService : IApproverRoutingService
    {
        private readonly IUserLookupService _userLookup;
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepo;
        private readonly IDepartmentRepositoryAsync _departmentRepo;

        public CompositeApproverRoutingService(
            IUserLookupService userLookup,
            IPurchaseRequestRepositoryAsync purchaseRequestRepo,
            IDepartmentRepositoryAsync departmentRepo)
        {
            _userLookup = userLookup;
            _purchaseRequestRepo = purchaseRequestRepo;
            _departmentRepo = departmentRepo;
        }

        public async Task<string> GetDepartmentManagerEmailByUserIdAsync(string userId)
        {
            var departmentIdString = await _userLookup.GetUserDepartmentIdAsync(userId);
            if (string.IsNullOrEmpty(departmentIdString)) return string.Empty;

            if (!int.TryParse(departmentIdString, out var departmentId)) return string.Empty;

            var department = await _departmentRepo.GetByIdAsync(departmentId);
            if (department == null || string.IsNullOrEmpty(department.ManagerId))
                return string.Empty;

            return await _userLookup.GetEmailAsync(department.ManagerId);
        }
    }
}