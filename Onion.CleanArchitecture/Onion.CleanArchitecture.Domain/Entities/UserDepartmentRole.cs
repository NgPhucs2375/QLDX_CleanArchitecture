using System;
using Onion.CleanArchitecture.Domain.Common;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Domain.Entities
{
    /// <summary>
    /// Trả lời cho câu hỏi Anh A giữ chức vụ gì ở phòng ban B?
    /// </summary>
    public class UserDepartmentRole : AuditableBaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    
    // cccd
    public PDXROLE Role { get; set; } 
    
    public virtual Department Department { get; set; } = null!;
}
}
