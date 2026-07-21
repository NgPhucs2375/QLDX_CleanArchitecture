using AutoMapper;
using Onion.CleanArchitecture.Infrastructure.Identity.Models;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Queries.GetUserById
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<ApplicationUser, GetUserByIdModel>();
        }
    }
}
