using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
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
    }
}
