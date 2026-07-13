using System;
using System.Collections.Generic;
using System.Text;

/// <summary>
/// 
///  mailman
/// 
/// Cũng như file JWTSetting là 1 khung mẫu tùy chọn
/// Goal : là để map các thông số cấu hình hòm thư điện tử từ appsettings.json vào 
/// </summary>

namespace Onion.CleanArchitecture.Domain.Settings
{
    public class MailSettings
    {
        // Các thông số cấu hình hòm thư điện tử được nạp từ file appsettings.json
        // EmailFrom: Địa chỉ email gửi đi
        public string EmailFrom { get; set; }
        // SmtpHost: Địa chỉ máy chủ SMTP
        public string SmtpHost { get; set; }
        // SmtpPort: Cổng SMTP
        public int SmtpPort { get; set; }
        // SmtpUser: Tên người dùng SMTP
        public string SmtpUser { get; set; }
        // SmtpPass: Mật khẩu SMTP
        public string SmtpPass { get; set; }
        // DisplayName: Tên hiển thị
        public string DisplayName { get; set; }
    }
}
