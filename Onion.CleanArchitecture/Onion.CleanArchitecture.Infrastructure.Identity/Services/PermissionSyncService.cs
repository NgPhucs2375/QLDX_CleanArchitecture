using Casbin;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.Infrastructure.Identity.Contexts;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Services
{
    public class PermissionSyncService
    {
        private readonly IdentityContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly Enforcer _enforcer;

        public PermissionSyncService(
            IdentityContext context,
            RoleManager<IdentityRole> roleManager,
            Enforcer enforcer)
        {
            _context = context;
            _roleManager = roleManager;
            _enforcer = enforcer;
        }

        public async Task SyncAsync()
        {
            var roles = await _roleManager.Roles.ToListAsync();

            foreach (var role in roles)
            {
                await _enforcer.RemoveFilteredPolicyAsync(0, role.Name);

                var roleClaims = _context.RoleClaims.Where(rc => rc.RoleId == role.Id).ToList();
                foreach (var claim in roleClaims)
                {
                    var actions = claim.ClaimValue.Split('#');
                    foreach (var action in actions)
                    {
                        _enforcer.AddPolicy(role.Name, claim.ClaimType, action);
                    }
                }
            }

            await _enforcer.SavePolicyAsync();
        }
    }
}
