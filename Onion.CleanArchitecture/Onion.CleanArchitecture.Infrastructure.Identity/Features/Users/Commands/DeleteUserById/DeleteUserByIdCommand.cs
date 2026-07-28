using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using Microsoft.AspNetCore.Identity;

namespace Onion.CleanArchitecture.Infrastructure.Identity
{
    public class DeleteUserByIdCommand : IRequest<Response<ApplicationUser>>
    {
        public string Id { get; set; }
        public class DeleteUserByIdCommandHandler : IRequestHandler<DeleteUserByIdCommand, Response<ApplicationUser>>
        {
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly IEventBusService _eventBusService;
            public DeleteUserByIdCommandHandler(
                UserManager<ApplicationUser> userManager,
                IEventBusService eventBusService)
            {
                _userManager = userManager;
                _eventBusService = eventBusService;
            }
            public async Task<Response<ApplicationUser>> Handle(DeleteUserByIdCommand command, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByIdAsync(command.Id);
                if (user == null) throw new ApiException($"User Not Found.");
                await _userManager.DeleteAsync(user);
                await _eventBusService.PublishAsync(new UserEmailSyncedEvent(
                    UserId: user.Id,
                    Email: user.Email,
                    DisplayName: $"{user.FirstName} {user.LastName}",
                    EventType: "Deleted",
                    OccurredAt: DateTime.UtcNow
                ), cancellationToken);
                return new Response<ApplicationUser>(user);
            }
        }
    }
}
