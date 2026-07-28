using Onion.CleanArchitecture.NotificationService.Models;

namespace Onion.CleanArchitecture.NotificationService.Services
{
    public interface INotificationStore
    {
        // Lưu thực thể Noti vào cơ sở dữ liệu
        Task<Notification> SaveAsync(Notification noti);
        // Lấy 1 list thực thể Noti theo userId, skip, take
        Task<List<Notification>> GetByUserIdAsync(string userId, int skip, int take);
        // Lấy số lượng Noti chưa đọc theo userId
        Task<int> GetUnreadCountAsync(string userId);
        // Đánh dấu Noti là đã đọc theo notificationId
        Task MarkAsReadAsync(Guid notificationId);
    }
}