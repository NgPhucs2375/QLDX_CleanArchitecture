using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Onion.CleanArchitecture.Application.DTOs.Email;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Domain.Settings;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Services
{
    public class EmailService : IEmailService
    {
        public MailSettings _mailSettings { get; }
        public ILogger<EmailService> _logger { get; }

        public EmailService(IOptions<MailSettings> mailSettings, ILogger<EmailService> logger)
        {
            _mailSettings = mailSettings.Value;
            _logger = logger;
        }

        public async Task SendAsync(EmailRequest request)
        {
            try
            {
                _logger.LogInformation("EmailFrom config: '{EmailFrom}', Request.From: '{RequestFrom}', Request.To: '{RequestTo}'", 
                    _mailSettings.EmailFrom, request.From, request.To);
                
                // create message
                var email = new MimeMessage();
                var fromAddress = request.From ?? _mailSettings.EmailFrom;
                if (string.IsNullOrWhiteSpace(fromAddress))
                    throw new ApiException("EmailFrom is not configured in MailSettings");
                if (string.IsNullOrWhiteSpace(request.To))
                    throw new ApiException("EmailTo is not provided");
                email.Sender = MailboxAddress.Parse(fromAddress);
                email.To.Add(MailboxAddress.Parse(request.To));
                email.Subject = request.Subject;
                var builder = new BodyBuilder();
                builder.HtmlBody = request.Body;
                email.Body = builder.ToMessageBody();
                using var smtp = new SmtpClient();
                smtp.Connect(_mailSettings.SmtpHost, _mailSettings.SmtpPort, SecureSocketOptions.StartTls);
                smtp.Authenticate(_mailSettings.SmtpUser, _mailSettings.SmtpPass);
                await smtp.SendAsync(email);
                smtp.Disconnect(true);

            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                throw new ApiException(ex.Message);
            }
        }
    }
}
