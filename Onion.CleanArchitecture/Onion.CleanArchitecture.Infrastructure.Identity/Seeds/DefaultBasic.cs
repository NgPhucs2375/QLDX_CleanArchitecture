using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Application.Enums;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Seeds
{
    public static class DefaultBasic
    {
        public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            var basicRole = await roleManager.FindByNameAsync(Roles.Basic.ToString());
            if (basicRole != null)
            {
                var claims = await roleManager.GetClaimsAsync(basicRole);

                if (!claims.Any(c => c.Type == "purchase-requests"))
                {
                    await roleManager.AddClaimAsync(basicRole, new System.Security.Claims.Claim("purchase-requests", "list#create#show#edit#submit#approve-department#reject#return-for-edit#return#approve#confirm-order#confirm#complete#trigger"));
                }

                if (!claims.Any(c => c.Type == "purchase-request-items"))
                {
                    await roleManager.AddClaimAsync(basicRole, new System.Security.Claims.Claim("purchase-request-items", "list#show#trigger"));
                }

                if (!claims.Any(c => c.Type == "purchase-request-logs"))
                {
                    await roleManager.AddClaimAsync(basicRole, new System.Security.Claims.Claim("purchase-request-logs", "list#trigger"));
                }
            }
        }
    }
}
