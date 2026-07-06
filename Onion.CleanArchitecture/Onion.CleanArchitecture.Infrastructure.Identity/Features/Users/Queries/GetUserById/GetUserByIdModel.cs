using System;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Queries.GetUserById
{
    public class GetUserByIdModel : ApplicationUser
    {
        public UserAvatarClaim Avatar { get; set; }
    }
}
