using System;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Queries.GetUserById
{
    public class GetUserByIdModel 
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string DepartmentId { get; set; }
        public bool IsActive { get; set; }
                public UserAvatarClaim Avatar { get; set; }
    }
}
