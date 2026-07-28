using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.NotificationService.Hubs;
using Onion.CleanArchitecture.NotificationService.Models;
using Onion.CleanArchitecture.NotificationService.Services;

namespace Onion.CleanArchitecture.NotificationService.Consumers
{
    public class NotifyReturnedForEditConsumer : IConsumer<NotifyReturnedForEditCommand>
    {
        private readonly IHubContext<NotificationHub> _hub;
        private readonly INotificationStore _noti;
        private readonly ILogger<NotifyReturnedForEditConsumer> _logger;

        public NotifyReturnedForEditConsumer(
            IHubContext<NotificationHub> hub,
            INotificationStore noti,
            ILogger<NotifyReturnedForEditConsumer> logger)
        {
            _hub = hub;
            _noti = noti;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<NotifyReturnedForEditCommand> context)
        {
            var cmd = context.Message;
            var noti = new Notification
            {
                UserId = cmd.UserId,
                Title = "Phiếu đề xuất được trả về chỉnh sửa",
                Body = cmd.Message,
                RequestId = cmd.RequestId,
                ActionUrl = $"/purchase-requests/{cmd.RequestId}"
            };
            await _noti.SaveAsync(noti);

            var message = new NotificationMessage
            {
                Type = "warning",
                Title = "Phiếu đề xuất được trả về chỉnh sửa",
                Body = cmd.Message,
                RequestId = cmd.RequestId,
                ActionUrl = $"/purchase-requests/{cmd.RequestId}",
                CreatedAt = noti.CreatedAt
            };
            await _hub.Clients.Group(cmd.UserId).SendAsync("ReceiveNotification", message);
            _logger.LogInformation("[Notification] Gửi tới {UserId}, RequestId={RequestId}", cmd.UserId, cmd.RequestId);
        }
    }
}