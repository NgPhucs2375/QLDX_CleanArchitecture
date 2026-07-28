using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class SendControlRejectedEmailConsumer : IConsumer<SendControlRejectedEmailCommand>
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<SendControlRejectedEmailConsumer> _logger;
        private readonly EmailDbContext _emailDB;


        public SendControlRejectedEmailConsumer(IEmailService emailService, ILogger<SendControlRejectedEmailConsumer> logger, EmailDbContext emailDB)
        {
            _emailService = emailService;
            _logger = logger;
            _emailDB = emailDB;
        }

        public async Task Consume(ConsumeContext<SendControlRejectedEmailCommand> context)
        {
            var userEmail = await _emailDB.UserEmails.FindAsync(context.Message.RecipientId);
            if (userEmail == null)
            {
                _logger.LogWarning("Không tìm thấy thông tin email của user {UserId}, không thể gửi email", context.Message.RejectedBy);
                return;
            }
            var message = context.Message;

            _logger.LogInformation(
                "Phiếu đề xuất {RequestId} đã bị Kiểm soát {RejectedBy} từ chối",
                message.RequestId, message.RejectedBy);

            var emailRequest = new Application.DTOs.Email.EmailRequest
            {
                To = userEmail.Email,
                Subject = $"Phiếu đề xuất #{message.RequestId} Đã Bị Kiểm Soát Từ Chối",
                Body = $"Phiếu đề xuất (ID: {message.RequestId}) đã bị {message.RejectedBy} (Kiểm soát) từ chối. Lý do: {message.Note}."
            };

            await _emailService.SendAsync(emailRequest);
        }
    }
}
