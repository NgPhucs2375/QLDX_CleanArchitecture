using System;
using System.Collections.Generic;
using System.Text;
   /// <summary>
        /// Đây là ví dụ mở rộng hơn của BaseEntity 
        /// tạo nền biến đã được khai báo sẵn các trường thông tin
        /// từ đó giúp các lớp con sau này kế thừa đẽ dàng,nhanh chóng và đồng bộ
        /// 
        /// </summary>
namespace Onion.CleanArchitecture.Domain.Common
{
    public abstract class AuditableBaseEntity
    {
        public virtual int Id { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; }
        public string LastModifiedBy { get; set; }
        public DateTime? LastModified { get; set; }
        // DateTime? : dấu ? có nghĩa là trường này có thể null, 
    }
}
