using MassTransit;
using Microsoft.AspNetCore.Identity;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;

namespace Onion.CleanArchitecture.WebApp.Server.Consumers
{
    public class RequestUserSyncConsumer : IConsumer<RequestSyncEvent>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEventBusService _eventBusService;

        public RequestUserSyncConsumer(
            UserManager<ApplicationUser> userManager,
            IEventBusService eventBusService)
        {
            _userManager = userManager;
            _eventBusService = eventBusService;
        }

        public async Task Consume(ConsumeContext<RequestSyncEvent> context)
        {
            var users = _userManager.Users.ToList();
            foreach (var user in users)
            {
                await _eventBusService.PublishAsync(new UserEmailSyncedEvent(
                    UserId: user.Id,
                    Email: user.Email,
                    DisplayName: $"{user.FirstName} {user.LastName}",
                    EventType: "Created",
                    OccurredAt: DateTime.UtcNow
                ));
            }
        }
    }
}
