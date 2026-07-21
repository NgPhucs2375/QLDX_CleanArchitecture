using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Services
{
    public class UserLookupService : IUserLookupService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserLookupService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<string> GetDisplayNameAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return string.Empty;
            return $"{user.FirstName} {user.LastName}".Trim();
        }

        public async Task<List<UserDepartmentInfo>> GetUsersByDepartmentIdAsync(int departmentId)
        {
            return await _userManager.Users
                .Where(u => u.DepartmentId == departmentId)
                .Select(u => new UserDepartmentInfo
                {
                    UserId = u.Id,
                    DisplayName = (u.FirstName + " " + u.LastName).Trim()
                })
                .ToListAsync();
        }
    }
}
