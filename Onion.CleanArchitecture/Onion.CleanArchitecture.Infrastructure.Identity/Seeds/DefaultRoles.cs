using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Application.Enums;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Seeds
{
    public static class DefaultRoles
    {
        public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            //Seed Roles (tiếng Việt - match policy.csv)
            await roleManager.CreateAsync(new IdentityRole("Quản trị viên hệ thống"));
            await roleManager.CreateAsync(new IdentityRole("Kiểm soát"));
            await roleManager.CreateAsync(new IdentityRole("Trưởng đơn vị"));
            await roleManager.CreateAsync(new IdentityRole("Người tạo đề xuất"));
            await roleManager.CreateAsync(new IdentityRole("Nhân sự nhận hàng"));
        }
    }
}
