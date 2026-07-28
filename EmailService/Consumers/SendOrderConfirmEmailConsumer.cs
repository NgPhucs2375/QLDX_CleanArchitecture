using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class SendOrderConfirmEmailConsumer : IConsumer<SendOrderConfirmedEmailCommand>
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<SendOrderConfirmEmailConsumer> _logger;
        private readonly EmailDbContext _emailDB;
        public SendOrderConfirmEmailConsumer(IEmailService emailService, ILogger<SendOrderConfirmEmailConsumer> logger, EmailDbContext emailDB)
        {
            _emailService = emailService;
            _logger = logger;
            _emailDB = emailDB;
        }

        public async Task Consume(ConsumeContext<SendOrderConfirmedEmailCommand> context)
        {
            var userEmail = await _emailDB.UserEmails.FindAsync(context.Message.RecipientId);
            if (userEmail == null)
            {
                _logger.LogWarning("Không tìm thấy thông tin email của user {UserId}, không thể gửi email", context.Message.ConfirmedBy);
                return;
            }
            var message = context.Message;

            _logger.LogInformation(
                "Phiếu đề xuất {RequestId} đã được {ConfirmedBy} xác nhận đơn hàng, đang gửi email thông báo",
                message.RequestId, message.ConfirmedBy);

            var emailRequest = new Application.DTOs.Email.EmailRequest
            {
                To = userEmail.Email,
                Subject = $"Phiếu đề xuất #{message.RequestId} Đã Hoàn Thành",
                Body = $"Phiếu đề xuất (ID: {message.RequestId}) đã được {message.ConfirmedBy} xác nhận đơn hàng và hoàn thành."
            };

            await _emailService.SendAsync(emailRequest);
        }
    }
}
