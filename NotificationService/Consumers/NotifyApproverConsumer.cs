using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.NotificationService.Hubs;
using Onion.CleanArchitecture.NotificationService.Models;
using Onion.CleanArchitecture.NotificationService.Services;

namespace Onion.CleanArchitecture.NotificationService.Consumers ;

public class NotifyApproverConsumer : IConsumer<NotifyApproverCommand>{
    
    private readonly IHubContext<NotificationHub> _hub;
    private readonly INotificationStore _noti;
    private readonly ILogger<NotifyApproverConsumer> _logger;

    public NotifyApproverConsumer(
        IHubContext<NotificationHub> hub,
        INotificationStore noti,
        ILogger<NotifyApproverConsumer> logger
    )
    {
        _hub = hub;
        _noti = noti;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<NotifyApproverCommand> context)
    {
        var cmd = context.Message;
        //
        var Notifi = new Notification
        {
            UserId = cmd.UserId,
            Title = "Phiếu đề xuất cần duyệt",
            Body = cmd.Message,
            RequestId = cmd.RequestId,
            ActionUrl = $"/purchase-requests/{cmd.RequestId}"
        };
        await _noti.SaveAsync(Notifi);


        var notification = new NotificationMessage{
            Type = "info",
            Title = "Phiếu đề xuất cần duyệt",
            Body = cmd.Message,
            RequestId = cmd.RequestId,
            ActionUrl = $"/purchase-requests/{cmd.RequestId}",
            CreatedAt = Notifi.CreatedAt,
        };
        await _hub.Clients.Group(cmd.UserId).SendAsync("ReceiveNotification",notification);
        _logger.LogInformation(
            "[Notification] gửi tới người dùng = {UserId}, RequestId={RequestId}",cmd.UserId,cmd.RequestId
        );
    }
}