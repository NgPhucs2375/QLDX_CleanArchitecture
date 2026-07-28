using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.EmailService.Data;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class UserEmailSyncConsumer : IConsumer<UserEmailSyncedEvent>
    {
        private readonly EmailDbContext _emailDB;
        private readonly ILogger<UserEmailSyncConsumer> _logger;

        public UserEmailSyncConsumer(EmailDbContext emailDB, ILogger<UserEmailSyncConsumer> logger)
        {
            _emailDB = emailDB;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<UserEmailSyncedEvent> context)
        {
            var msg = context.Message;
            if(msg.EventType == "Deleted"){
                var user = await _emailDB.UserEmails.FindAsync(msg.UserId);
                if(user != null) _emailDB.UserEmails.Remove(user);
            }
            else
            {
                var user = await _emailDB.UserEmails.FindAsync(msg.UserId);
                if(user == null)
                {
                    user = new UserEmail
                    {
                        Id = msg.UserId,
                    };
                    _emailDB.UserEmails.Add(user);
                }
                user.Email = msg.Email;
                user.DisplayName = msg.DisplayName;
                user.LastSyncedAt = msg.OccurredAt;
            }
            await _emailDB.SaveChangesAsync();
            _logger.LogInformation("Synced user {UserId}:{Email}",msg.UserId,msg.Email);
        }   
    }
}