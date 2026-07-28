using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class SendControlApprovedEmailConsumer : IConsumer<SendControlApprovedEmailCommand>
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<SendControlApprovedEmailConsumer> _logger;
        private readonly EmailDbContext _emailDB;

        public SendControlApprovedEmailConsumer(IEmailService emailService, ILogger<SendControlApprovedEmailConsumer> logger, EmailDbContext emailDB)
        {
            _emailService = emailService;
            _logger = logger;
            _emailDB = emailDB;
        }

        public async Task Consume(ConsumeContext<SendControlApprovedEmailCommand> context)
        {
            var userEmail = await _emailDB.UserEmails.FindAsync(context.Message.ApprovedBy);
            if (userEmail == null)
            {
                _logger.LogWarning("Không tìm thấy thông tin email của user {UserId}, không thể gửi email", context.Message.ApprovedBy);
                return;
            }
            var message = context.Message;

            _logger.LogInformation(
                "Phiếu đề xuất {RequestId} đã được Kiểm soát {ApprovedBy} duyệt, đang gửi email đến người tạo",
                message.RequestId, message.ApprovedBy);

            var emailRequest = new Application.DTOs.Email.EmailRequest
            {
                To = userEmail.Email,
                Subject = $"Phiếu đề xuất #{message.RequestId} Đã Được Kiểm Soát Duyệt",
                Body = $"Phiếu đề xuất (ID: {message.RequestId}) đã được {message.ApprovedBy} (Kiểm soát) duyệt. Vui lòng kiểm tra và nhập số lượng thực tế để xác nhận đơn hàng."
            };

            await _emailService.SendAsync(emailRequest);
        }
    }
}
