using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class SendReturnedForEditEmailConsumer : IConsumer<SendReturnedForEditEmailCommand>
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<SendReturnedForEditEmailConsumer> _logger;
        private readonly EmailDbContext _emailDB;
        public SendReturnedForEditEmailConsumer(IEmailService emailService, ILogger<SendReturnedForEditEmailConsumer> logger, EmailDbContext emailDB)
        {
            _emailService = emailService;
            _logger = logger;
            _emailDB = emailDB;
        }

        public async Task Consume(ConsumeContext<SendReturnedForEditEmailCommand> context)
        {
            var userEmail = await _emailDB.UserEmails.FindAsync(context.Message.RecipientId);
            if (userEmail == null)
            {
                _logger.LogWarning("Không tìm thấy thông tin email của user {UserId}, không thể gửi email", context.Message.ReturnedBy);
                return;
            }
            var message = context.Message;

            _logger.LogInformation(
                "Phiếu đề xuất {RequestId} đã được {ReturnedBy} trả về để chỉnh sửa",
                message.RequestId, message.ReturnedBy);

            var emailRequest = new Application.DTOs.Email.EmailRequest
            {
                To = userEmail.Email,
                Subject = $"Phiếu đề xuất #{message.RequestId} Đã Được Trả Về Để Chỉnh Sửa",
                Body = $"Phiếu đề xuất (ID: {message.RequestId}) đã được {message.ReturnedBy} trả về để chỉnh sửa. Lý do: {message.Note}. Vui lòng sửa lại và gửi lại."
            };

            await _emailService.SendAsync(emailRequest);
        }
    }
}
