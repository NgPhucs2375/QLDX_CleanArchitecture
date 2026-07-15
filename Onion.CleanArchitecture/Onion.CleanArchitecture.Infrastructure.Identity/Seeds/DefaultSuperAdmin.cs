using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Seeds
{
    public static class DefaultSuperAdmin
    {
        public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            //Seed Default User
            var defaultUser = new ApplicationUser
            {
                UserName = "superadmin",
                Email = "superadmin@gmail.com",
                FirstName = "Mukesh",
                LastName = "Murugan",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true
            };
            if (userManager.Users.All(u => u.Id != defaultUser.Id))
            {
                var user = await userManager.FindByEmailAsync(defaultUser.Email);
                if (user == null)
                {
                    await userManager.CreateAsync(defaultUser, "123Pa$$word!");
                    await userManager.AddToRoleAsync(defaultUser, "Quản trị viên hệ thống");

                    // Get the SuperAdmin role (Vietnamese name)
                    var role = await roleManager.FindByNameAsync("Quản trị viên hệ thống");

                    // Add the RoleClaim to the SuperAdmin role
                    if (role != null)
                    {
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("roleclaims", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("users", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("roles", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("categories", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("products", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("departments", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("proposal-configs", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("config-categories", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("config-approvers", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("purchase-requests", "list#create#show#edit#delete#submit#approve-department#reject#return-for-edit#approve#confirm-order#complete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("purchase-request-categories", "list#create#show#edit#delete"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("purchase-request-items", "list#create#show#edit#delete#update-actual-quantity"));
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("purchase-request-logs", "list#create#show#edit#delete"));
                    }
                }
            }

            // Ensure claims exist for SuperAdmin role even for existing databases
            var superAdminRole = await roleManager.FindByNameAsync("Quản trị viên hệ thống");
            if (superAdminRole != null)
            {
                var claims = await roleManager.GetClaimsAsync(superAdminRole);
                
                if (!claims.Any(c => c.Type == "categories"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("categories", "list#create#show#edit#delete"));
                }
                
                if (!claims.Any(c => c.Type == "products"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("products", "list#create#show#edit#delete"));
                }

                if (!claims.Any(c => c.Type == "departments"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("departments", "list#create#show#edit#delete"));
                }

                if (!claims.Any(c => c.Type == "proposal-configs"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("proposal-configs", "list#create#show#edit#delete"));
                }

                if (!claims.Any(c => c.Type == "config-categories"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("config-categories", "list#create#show#edit#delete"));
                }

                if (!claims.Any(c => c.Type == "config-approvers"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("config-approvers", "list#create#show#edit#delete"));
                }

                if (!claims.Any(c => c.Type == "purchase-requests"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("purchase-requests", "list#create#show#edit#delete#submit#approve-department#reject#return-for-edit#approve#confirm-order#complete"));
                }

                if (!claims.Any(c => c.Type == "purchase-request-categories"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("purchase-request-categories", "list#create#show#edit#delete"));
                }

                if (!claims.Any(c => c.Type == "purchase-request-items"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("purchase-request-items", "list#create#show#edit#delete#update-actual-quantity"));
                }

                if (!claims.Any(c => c.Type == "purchase-request-logs"))
                {
                    await roleManager.AddClaimAsync(superAdminRole, new System.Security.Claims.Claim("purchase-request-logs", "list#create#show#edit#delete"));
                }
            }
        }
    }
}