namespace Onion.CleanArchitecture.Domain.Enums
{
    public enum PDXROLE
    {


        /// <summary>
        /// Bước 1 – Duyệt cấp đơn vị (Do Trưởng đơn vị xử lý)
        /// </summary>
        TruongDonVi = 1,

        /// <summary>
        /// Bước 2 – Kiểm soát (Do Nhân sự kiểm soát xử lý)
        /// </summary>
        /// 
        KiemSoat = 2,
        /// <summary>
        ///  Người Tạo yêu cầu đề xuất
        /// </summary>
        /// 
        NguoiTaoPDX = 3,

        /// <summary>
        /// Nhân sự nhận hàng
        /// </summary>
        /// 
        NSNH = 4,
    }
}