using MassTransit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.NotificationService.Hubs;
using Onion.CleanArchitecture.NotificationService.Models;
using Onion.CleanArchitecture.NotificationService.Services;

namespace Onion.CleanArchitecture.NotificationService.Consumers
{
    public class NotifyOrderConfirmedConsumer : IConsumer<NotifyOrderConfirmedCommand>
    {
        private readonly IHubContext<NotificationHub> _hub;
        private readonly INotificationStore _noti;
        private readonly ILogger<NotifyOrderConfirmedConsumer> _logger;

        public NotifyOrderConfirmedConsumer(
            IHubContext<NotificationHub> hub,
            INotificationStore noti,
            ILogger<NotifyOrderConfirmedConsumer> logger)
        {
            _hub = hub;
            _noti = noti;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<NotifyOrderConfirmedCommand> context)
        {
            var cmd = context.Message;
            var noti = new Notification
            {
                UserId = cmd.UserId,
                Title = "Phiếu đề xuất hoàn thành",
                Body = cmd.Message,
                RequestId = cmd.RequestId,
                ActionUrl = $"/purchase-requests/{cmd.RequestId}"
            };
            await _noti.SaveAsync(noti);

            var message = new NotificationMessage
            {
                Type = "success",
                Title = "Phiếu đề xuất hoàn thành",
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