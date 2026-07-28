using Onion.CleanArchitecture.NotificationService.Models;

namespace Onion.CleanArchitecture.NotificationService.Services
{
    public class InMemoryNotificationStore: INotificationStore
    {
        // Injec 1 list Noti vào để lưu trữ tạm thời trong bộ nhớ
        private readonly List<Notification> _listNoti = new();
        // Khóa để đồng bộ hóa truy cập vào danh sách thông báo
        private readonly object _lock = new();
        
        // Luu 1 Noti vao list trong bo nho
        public Task<Notification> SaveAsync(Notification noti)
        {
            lock (_lock)
            {
                _listNoti.Add(noti);
            }
            return Task.FromResult(noti);
        }

        public Task<List<Notification>> GetByUserIdAsync(string userId,int skip,int take){
            lock(_lock){
                var results = _listNoti
                    .Where(n=> n.UserId == userId)
                    .OrderByDescending(n=> n.CreatedAt)
                    .Skip(skip)
                    .Take(take)
                    .ToList();
                return Task.FromResult(results);
            }
        }

        public Task<int> GetUnreadCountAsync(string userId)
        {
            lock (_lock)
            {
                var count = _listNoti.Count(n=> n.UserId == userId && !n.IsRead);
                return Task.FromResult(count);
            }
        }

        public Task MarkAsReadAsync(Guid notificationId)
        {
            lock (_lock)
            {
                var noti = _listNoti.FirstOrDefault(n => n.Id == notificationId);
                if(noti != null)
                {
                    noti.IsRead = true;
                }
            }
            return Task.CompletedTask;
        }
    }
}