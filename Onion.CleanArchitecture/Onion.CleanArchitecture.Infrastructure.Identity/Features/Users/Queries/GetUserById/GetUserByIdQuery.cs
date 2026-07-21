using MediatR;
using System.Linq;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Infrastructure.Identity.Contexts;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Queries.GetUserById
{
    public class GetUserByIdQuery : IRequest<Response<GetUserByIdModel>>
    {
        public string Id { get; set; }
        public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Response<GetUserByIdModel>>
        {
            private readonly IMapper _mapper;
            private readonly RoleManager<IdentityRole> _roleManager;
            private readonly UserManager<ApplicationUser> _userManager;
            private readonly IdentityContext _context;

            public GetUserByIdQueryHandler(
                IMapper mapper,
                RoleManager<IdentityRole> roleManager,
                UserManager<ApplicationUser> userManager,
                IdentityContext context)
            {
                _mapper = mapper;
                _roleManager = roleManager;
                _userManager = userManager;
                _context = context;
            }

            public async Task<Response<GetUserByIdModel>> Handle(GetUserByIdQuery query, CancellationToken cancellationToken)
            {
                var user = await _userManager.FindByIdAsync(query.Id);
                if (user == null) throw new ApiException($"User Not Found.");

                var userRole = await (from ur in _context.UserRoles
                                      join r in _context.Roles on ur.RoleId equals r.Id
                                      where ur.UserId == user.Id
                                      select r).FirstOrDefaultAsync();

                if (userRole == null) throw new ApiException($"User Role Not Found.");

                user.RoleId = userRole.Id;
                var userClaims = await _userManager.GetClaimsAsync(user);
                var userModel = new GetUserByIdModel
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    UserName = user.UserName,
                    DepartmentId = user.DepartmentId.ToString(),
                    IsActive = user.IsActive
                };
                userModel.Avatar = new UserAvatarClaim
                {
                    AvatarUid = userClaims.FirstOrDefault(x => x.Type == "AvatarUid")?.Value,
                    AvatarUrl = userClaims.FirstOrDefault(x => x.Type == "AvatarUrl")?.Value
                };
                return new Response<GetUserByIdModel>(userModel);
            }
        }
    }
}
