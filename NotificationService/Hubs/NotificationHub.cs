using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace Onion.CleanArchitecture.NotificationService.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

     /// <summary>
    /// Khi client connect thành công, tự động join vào group = userId của họ
    /// Sau này muốn push notification cho user "abc" → gửi về group "abc"
    /// </summary>
    
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId, userId
            );
            _logger.LogInformation("[SignalR] người dùng {UserId} đã kết nối với (Connection: {ConnId})",userId,Context.ConnectionId);
        }
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Client có thể gọi để đánh dấu đã đọc
    /// </summary>
    
    public async Task MarkAsRead(Guid notificationId)
    {
        await Clients.Client(Context.ConnectionId).SendAsync("NotificationRead",notificationId);
    }
    
}