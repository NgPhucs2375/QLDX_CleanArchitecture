using System;
using System.Collections.Generic;
using System.Text;

namespace Onion.CleanArchitecture.Application.Enums
{
    public enum Roles
    {
    /// <summary>
    /// Quản trị hệ thống : full quyền 
    /// </summary>
        SuperAdmin, 

    /// <summary>
    /// Kiểm soát : purchase-requests: list, show, approve, reject, return-for-edit
    ///         config-approvers: list (để biết mình là người kiểm soát config nào
    ///         products : list, show
    /// </summary>
        Admin,
    /// <summary>
    /// Trưởng đơn vị : purchase-requests: list, show, approve-department, reject
    ///             Chỉ duyệt được phiếu thuộc đơn vị mình quản lí (theo Department.Manager)
    ///</summary>  
    /// 
        Moderator,
    /// <summary>
    /// Người tạo đề xuất : purchase-requests: list, create, show, edit (chỉ phiếu của mình)
    ///  categories: list (để xem danh mục khi tạo phiếu)
    ///  products: list (để chọn sản phẩm khi tạo phiếu)
    /// </summary>
        Basic,
    /// <summary>
    /// Nhân sự nhân hàng : purchase-requests: list, show (chỉ phiếu đã xác nhận)
    ///  purchase-request-items: update-actual-quantity
    /// </summary>
        Receiver
    }
}
