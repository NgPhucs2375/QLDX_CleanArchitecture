using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Infrastructure.Identity.Contexts;
using Microsoft.AspNetCore.Identity;
using Casbin;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.RoleClaim.Commands.CreateRoleClaim
{
    public class CreateRoleClaimCommand : IRequest<Response<IdentityRoleClaim<string>>>
    {
        public string RoleId { get; set; }
        public string ClaimType { get; set; }
        public string[] ClaimValue { get; set; }

        public class CreateRoleClaimCommandHandler : IRequestHandler<CreateRoleClaimCommand, Response<IdentityRoleClaim<string>>>
        {
            private readonly Enforcer _enforcer;
            private readonly IdentityContext _context;

            public CreateRoleClaimCommandHandler(
                Enforcer enforcer,
                IdentityContext context)
            {
                _enforcer = enforcer;
                _context = context;
            }

            public async Task<Response<IdentityRoleClaim<string>>> Handle(CreateRoleClaimCommand request, CancellationToken cancellationToken)
            {
                var roleClaim = new IdentityRoleClaim<string>
                {
                    RoleId = request.RoleId,
                    ClaimType = request.ClaimType,
                    ClaimValue = string.Join("#", request.ClaimValue)
                };
                var role = await _context.Roles.FindAsync(request.RoleId);
                await _enforcer.RemoveFilteredPolicyAsync(0, role.Name, request.ClaimType);
                foreach (var value in request.ClaimValue)
                {
                    _enforcer.AddPolicy(role.Name, request.ClaimType, value);
                }
                await _enforcer.SavePolicyAsync();
                _context.RoleClaims.Add(roleClaim);
                await _context.SaveChangesAsync();

                return new Response<IdentityRoleClaim<string>>(roleClaim);
            }
        }
    }
}
