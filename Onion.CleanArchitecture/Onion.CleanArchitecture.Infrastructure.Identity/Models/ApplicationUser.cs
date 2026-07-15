using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Application.DTOs.Account;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Models
{
    public class ApplicationUser : IdentityUser
    {
/// <summary>
///     TAMPLATE của chị Thơ
/// </summary>





        // Tùy theo template, khóa chính của IdentityUser có thể là Guid hoặc string

        
        public string FirstName { get; set; }
        public string LastName { get; set; }

        // BỔ SUNG YÊU CẦU CỦA BẠN: Khóa ngoại trỏ về bảng Department (Đơn vị)
        public int DepartmentId { get; set; } 
        
        // Trạng thái hoạt động
        public bool IsActive { get; set; } = true; 
        [NotMapped]
        public string RoleId { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; }
        public bool OwnsToken(string token)
        {
            return this.RefreshTokens?.Find(x => x.Token == token) != null;
        }
    }
}
