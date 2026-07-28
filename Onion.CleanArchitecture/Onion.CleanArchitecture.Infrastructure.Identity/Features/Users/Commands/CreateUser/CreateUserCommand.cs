using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Enums;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Commands.UpdateUser;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using Microsoft.AspNetCore.Identity;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Queries.CreateUser
{
    public partial class CreateUserCommand : IRequest<Response<ApplicationUser>>
    {
        public string RoleId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string PhoneNumber { get; set; }
        public bool EmailConfirmed { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public List<UpdateUserAvatar> Avatar { get; set; }

        public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Response<ApplicationUser>>
        {
            private readonly RoleManager<IdentityRole> _roleManager;
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly IEventBusService _eventBusService;
            public CreateUserCommandHandler(
                RoleManager<IdentityRole> roleManager,
                UserManager<ApplicationUser> userManager,
                IEventBusService eventBusService)
            {
                _roleManager = roleManager;
                _userManager = userManager;
                _eventBusService = eventBusService;
            }

            public async Task<Response<ApplicationUser>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
            {
                var userWithSameUserName = await _userManager.FindByNameAsync(request.UserName);
                if (userWithSameUserName != null)
                {
                    throw new ApiException($"Username '{request.UserName}' is already taken.");
                }
                var user = new ApplicationUser
                {
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    UserName = request.UserName,
                    EmailConfirmed = request.EmailConfirmed,
                };
                var userWithSameEmail = await _userManager.FindByEmailAsync(request.Email);
                if (userWithSameEmail == null)
                {
                    var result = await _userManager.CreateAsync(user, request.Password);
                    if (result.Succeeded)
                    {
                        var role = await _roleManager.FindByIdAsync(request.RoleId);
                        await _userManager.AddToRoleAsync(user, role.Name);
                        await _eventBusService.PublishAsync(new UserEmailSyncedEvent(
                            UserId: user.Id,
                            Email: user.Email,
                            DisplayName: $"{user.FirstName} {user.LastName}",
                            EventType: "Created",
                            OccurredAt: DateTime.UtcNow
                        ), cancellationToken);
                        // var verificationUri = await SendVerificationEmail(user, origin);
                        //TODO: Attach User Service here and configure it via appsettings
                        // await _emailService.SendAsync(new Application.DTOs.User.EmailRequest() { From = "mail@codewithmukesh.com", To = user.User, Body = $"Please confirm your account by visiting this URL {verificationUri}", Subject = "Confirm Registration" });
                        return new Response<ApplicationUser>(user);
                    }
                    else
                    {
                        throw new ApiException($"{result.Errors}");
                    }
                }
                else
                {
                    throw new ApiException($"User {request.Email} is already registered.");
                }
            }
        }
    }

}
