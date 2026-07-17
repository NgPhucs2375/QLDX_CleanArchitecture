using System;
using Onion.CleanArchitecture.Domain.Common;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class Department : AuditableBaseEntity
    {
        
        // Mã đơn vị
        public string Code { get; set; } = string.Empty; // Mã đơn vị
        // Tên đơn vị
        public string Name { get; set; } = string.Empty; // Tên đơn vị
        
        /// <summary>
        /// Khóa ngoại trỏ về bảng User (Identity) để biết ai là Trưởng đơn vị phụ trách
        /// </summary>
        public string ManagerId { get; set; }
        
        public bool IsActive { get; set; } = true; // Trạng thái
    }
}