using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class Category : AuditableBaseEntity
    {
        public string Code { get; set; } = string.Empty; // Mã danh mục
        public string Name { get; set; } = string.Empty; // Tên danh mục
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động của danh mục (mặc định là true)

        // Navigation
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}