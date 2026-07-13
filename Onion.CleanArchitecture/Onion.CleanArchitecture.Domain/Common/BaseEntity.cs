using System; // thư viện dụng để sử dụng các kiểu dữ liệu cơ bản và các chức năng liên quan đến thời gian
using System.Collections.Generic; // thư viện dụng để sử dụng các kiểu dữ liệu danh sách và các chức năng liên quan đến danh sách
using System.Text;// thư viện dụng để sử dụng các chức năng liên quan đến chuỗi ký tự

namespace Onion.CleanArchitecture.Domain.Common
{
       /// <summary>
        /// Khởi tạo lớp abstract nó ko tự tạo được object độc lập 
        /// mà nó sinh ra để cho các lớp khác kế thừa
        /// </summary>
    public abstract class BaseEntity
    {
        /// <summary>
        /// Chuẩn hóa khóa chính (Primary Key) : mục đích là để cho bất kỳ entity nào trong HT khi kế thừa BaseEntity sẽ
        /// nghiễm nhiên có sẵn trường id này làm khóa chính trong cơ sở dữ liệu từ đó tái sử dụng và không cần gọi 
        /// public int Id {get;set;} hàng chục lần ở các bảng khác nhau
        /// </summary>
        public virtual int Id { get; set; }
    }
}
