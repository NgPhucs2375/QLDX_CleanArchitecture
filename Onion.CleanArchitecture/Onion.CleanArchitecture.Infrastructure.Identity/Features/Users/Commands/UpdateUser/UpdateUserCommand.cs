using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using Microsoft.AspNetCore.Identity;
using System;

namespace Onion.CleanArchitecture
{
    public class UpdateUserCommand : IRequest<Response<ApplicationUser>>
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string RoleId { get; set; }
        public bool EmailConfirmed { get; set; }

        public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Response<ApplicationUser>>
        {
            private readonly RoleManager<IdentityRole> _roleManager;
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly IEventBusService _eventBusService;
            public UpdateUserCommandHandler(
                UserManager<ApplicationUser> userManager,
                RoleManager<IdentityRole> roleManager,
                IEventBusService eventBusService
                )
            {
                _userManager = userManager;
                _roleManager = roleManager;
                _eventBusService = eventBusService;
            }

            public async Task<Response<ApplicationUser>> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByIdAsync(command.Id);
                if (user == null) throw new ApiException($"User Not Found.");
                user.FirstName = command.FirstName ?? user.FirstName;
                user.LastName = command.LastName ?? user.LastName;
                if (!string.IsNullOrWhiteSpace(command.Email))
                {
                    var oldEmail = user.Email;
                    user.Email = command.Email;

                    // Nếu email thay đổi, cần confirm lại
                    if (user.Email != oldEmail)
                    {
                        user.EmailConfirmed = false;
                    }
                }
                user.EmailConfirmed = command.EmailConfirmed;
                await _userManager.UpdateAsync(user);

                await _eventBusService.PublishAsync(new UserEmailSyncedEvent(
                    UserId: user.Id,
                    Email: user.Email,
                    DisplayName: $"{user.FirstName} {user.LastName}",
                    EventType: "Updated",
                    OccurredAt: DateTime.UtcNow
                ), cancellationToken);

                var roles = await _userManager.GetRolesAsync(user);
                // Add user claim for avatar

                if (roles.Count > 0)
                {
                    var role = await _roleManager.FindByIdAsync(command.RoleId);
                    if (!roles.Contains(command.RoleId))
                    {
                        await _userManager.RemoveFromRolesAsync(user, roles);
                        await _userManager.AddToRoleAsync(user, role.Name);
                    }
                }
                return new Response<ApplicationUser>(user);
            }
        }
    }
}
