using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Application.Enums;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Seeds
{
    public static class DefaultSuperAdmin
    {
        public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            var defaultUser = new ApplicationUser
            {
                UserName = "SuperAdmin",
                Email = "superadmin@gmail.com",
                FirstName = "Mukesh",
                LastName = "Murugan",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true
            };

            var user = await userManager.FindByEmailAsync(defaultUser.Email);
            if (user == null)
            {
                var createResult = await userManager.CreateAsync(defaultUser, "123Pa$$word!");
                if (!createResult.Succeeded)
                {
                    // Bắt lỗi ngay nếu không tạo được User
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new Exception($"[Seeding Error] Không thể tạo user {defaultUser.Email}. Chi tiết: {errors}");
                }
                user = defaultUser;
            }

            var roleName = Roles.SuperAdmin.ToString();
            
            // Đảm bảo Role phải tồn tại trước khi gán User vào
            if (await roleManager.RoleExistsAsync(roleName))
            {
                if (!await userManager.IsInRoleAsync(user, roleName))
                {
                    var addToRoleResult = await userManager.AddToRoleAsync(user, roleName);
                    if (!addToRoleResult.Succeeded)
                    {
                        // Bắt lỗi ngay nếu không gán được Role (nguyên nhân gây ra lỗi null UserRoles của bạn)
                        var errors = string.Join(", ", addToRoleResult.Errors.Select(e => e.Description));
                        throw new Exception($"[Seeding Error] Không thể gán quyền {roleName} cho user. Chi tiết: {errors}");
                    }
                }
            }
            else
            {
                throw new Exception($"[Seeding Error] Quyền '{roleName}' chưa tồn tại trong database. Hãy chắc chắn DefaultRoles.SeedAsync đã được chạy trước file này!");
            }

            var role = await roleManager.FindByNameAsync(roleName);
            if (role != null)
            {
                var roleClaims = await roleManager.GetClaimsAsync(role);

                async Task AddClaimIfNotExist(string type, string value)
                {
                    if (!roleClaims.Any(c => c.Type == type && c.Value == value))
                    {
                        await roleManager.AddClaimAsync(role, new System.Security.Claims.Claim(type, value));
                    }
                }

                await AddClaimIfNotExist("roleclaims", "list#create#show#edit#delete");
                await AddClaimIfNotExist("users", "list#create#show#edit#delete");
                await AddClaimIfNotExist("roles", "list#create#show#edit#delete");
                await AddClaimIfNotExist("categories", "list#create#show#edit#delete");
                await AddClaimIfNotExist("products", "list#create#show#edit#delete");
                await AddClaimIfNotExist("departments", "list#create#show#edit#delete");
                await AddClaimIfNotExist("proposal-configs", "list#create#show#edit#delete");
                await AddClaimIfNotExist("config-categories", "list#create#show#edit#delete");
                await AddClaimIfNotExist("config-approvers", "list#create#show#edit#delete");
                await AddClaimIfNotExist("purchase-requests", "list#create#show#edit#delete#submit#approve-department#reject#return-for-edit#return#approve#confirm-order#confirm#complete");
                await AddClaimIfNotExist("purchase-request-categories", "list#create#show#edit#delete");
                await AddClaimIfNotExist("purchase-request-items", "list#create#show#edit#delete#update-actual-quantity#update-true-quantity-items");
                await AddClaimIfNotExist("purchase-request-logs", "list#create#show#edit#delete");
            }
        }
    }
}