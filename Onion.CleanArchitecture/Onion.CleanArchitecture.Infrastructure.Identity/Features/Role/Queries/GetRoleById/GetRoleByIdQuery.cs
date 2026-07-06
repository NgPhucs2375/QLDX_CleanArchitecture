using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Wrappers;
using Microsoft.AspNetCore.Identity;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Role.Queries.GetRoleById
{
    public class GetRoleByIdQuery : IRequest<Response<IdentityRole>>
    {
        public string Id { get; set; }
        public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, Response<IdentityRole>>
        {
            private readonly RoleManager<IdentityRole> _roleManager;

            public GetRoleByIdQueryHandler(RoleManager<IdentityRole> roleManager)
            {
                _roleManager = roleManager;
            }

            public async Task<Response<IdentityRole>> Handle(GetRoleByIdQuery query, CancellationToken cancellationToken)
            {
                var role = await _roleManager.FindByIdAsync(query.Id.ToString());
                if (role == null) throw new ApiException($"Role Not Found.");

                return new Response<IdentityRole>(role);
            }
        }
    }
}
