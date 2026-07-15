using Onion.CleanArchitecture.Domain.Common; // Gọi khai báo thư viện mà ta đã tạo trước đó để kế thừa từ đó tái sử dụng và đồng bộ thuộc tính và các trường

using System;
using System.Collections.Generic;
using System.Text; // thư viện dụng để sử dụng các chức năng liên quan đến chuỗi ký tự

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class Product : AuditableBaseEntity // kế thừa từ lớp abstract đã thiết kế ở Common
    {
        public string Code { get; set; } = string.Empty; // Mã sản phẩm
        public string Name { get; set; } = string.Empty; // Tên sản phẩm
        public int CategoryId { get; set; }
        public decimal UnitPrice { get; set; } // Giá đơn vị
        public string Unit { get; set; } = string.Empty; // Đơn vị tính
        public bool IsActive { get; set; } = true; // Trạng thái hoạt động của sản phẩm (mặc định là true)
        
        public virtual Category Category { get; set; }=null!;
        // null! là một cách để chỉ định rằng thuộc tính này sẽ không bao giờ là null, giúp tránh cảnh báo của trình biên dịch về khả năng null.
    }
       /// <summary>
        /// ở đây tương đương tới 
        /// int Id {get;set;}
        /// string CreatedBy {get;set;}
        /// DateTime Created {get;set;}
        /// string LastModifiedBy {get;set;}
        /// DateTime? LastModified {get;set;}
        /// 
        /// rồi khai báo thêm
        /// string Name {get;set;}
        /// string Barcode {get;set;}
        /// string Description {get;set;}
        /// decimal Rate {get;set;}
        /// decimal Price {get;set;}
        /// 
        /// </summary>
}
