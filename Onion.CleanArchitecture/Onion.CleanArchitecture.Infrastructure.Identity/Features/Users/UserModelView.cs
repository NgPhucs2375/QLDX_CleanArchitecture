using System;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users
{
    public class UserAvatarClaim
    {
        public string AvatarName { get; set; }
        public string AvatarUid { get; set; }
        public string AvatarUrl { get; set; }
    }
}
