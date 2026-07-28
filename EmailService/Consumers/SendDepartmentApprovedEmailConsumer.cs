using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class SendDepartmentApprovedEmailConsumer : IConsumer<SendDepartmentApprovedEmailCommand>
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<SendDepartmentApprovedEmailConsumer> _logger;
        private readonly EmailDbContext _emailDB;

        public SendDepartmentApprovedEmailConsumer(IEmailService emailService, ILogger<SendDepartmentApprovedEmailConsumer> logger, EmailDbContext emailDB)
        {
            _emailService = emailService;
            _logger = logger;
            _emailDB = emailDB;
        }

        public async Task Consume(ConsumeContext<SendDepartmentApprovedEmailCommand> context)
        {
            var userEmail = await _emailDB.UserEmails.FindAsync(context.Message.RecipientId);
            if (userEmail == null)
            {
                _logger.LogWarning("Không tìm thấy thông tin email của user {UserId}, không thể gửi email", context.Message.ApprovedBy);
                return;
            }
            var message = context.Message;

            _logger.LogInformation(
                "Phiếu đề xuất {RequestId} đã được Trưởng đơn vị {ApprovedBy} duyệt, đang gửi email đến Kiểm soát",
                message.RequestId, message.ApprovedBy);

            try
            {
                var emailRequest = new Application.DTOs.Email.EmailRequest
                {
                    To = userEmail.Email,
                    Subject = $"Phiếu đề xuất #{message.RequestId} Đã Được Trưởng Đơn Vị Duyệt",
                    Body = $"Phiếu đề xuất (ID: {message.RequestId}) đã được {message.ApprovedBy} duyệt ở cấp Trưởng đơn vị. Mời bạn kiểm tra và phê duyệt ở cấp Kiểm soát."
                };

                await _emailService.SendAsync(emailRequest);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gửi email thất bại cho phiếu {RequestId}", message.RequestId);
            }
        }
    }
}
