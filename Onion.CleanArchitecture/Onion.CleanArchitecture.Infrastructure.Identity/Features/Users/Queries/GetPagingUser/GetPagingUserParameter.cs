using Onion.CleanArchitecture.Application.Filters;
using System.Collections.Generic;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Users.Queries.GetPagingUser
{
    public class GetPagingUserParameter : RequestParameter
    {
        public List<string> id { get; set; }
    }
}
