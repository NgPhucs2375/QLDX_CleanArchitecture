using System;
using System.Collections.Generic;
using System.Text;

namespace Onion.CleanArchitecture.Domain.Settings
{
    public class JWTSettings
    {
        // Các thông số cấu hình JWT được nạp từ file appsettings.json
        // Key: Khóa bí mật dùng để mã hóa và giải mã JWT
        public string Key { get; set; }
        // Issuer: Tên của nhà phát hành JWT
        public string Issuer { get; set; }
        // Audience: Tên của người nhận JWT
        public string Audience { get; set; }
        // DurationInMinutes: Thời gian sống của JWT (tính bằng phút)
        public double DurationInMinutes { get; set; }
    }
}

        /// <summary>
        /// thay vì đọc các cấu hình và bảo mật trực tiếp bằng string từ appsettings.json
        /// (Rất dễ gõ sai và khó bảo trì)
        /// Kỹ thuật này gọi là Options Pattern (Mẫu thiết kế tùy chọn)
        /// 
        /// Idea: Tạo ra 1 Frame "Strongly-typed"(kiểu dữ liệu chặt chẽ) để hệ thống auto map(nạp)
        /// các thông số cấu hình JWT từ file appsetting .json
        /// </summary>