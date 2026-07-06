using System.Collections.Generic;
using Onion.CleanArchitecture.Application.Filters;

namespace Onion.CleanArchitecture.Infrastructure.Identity.Features.Role.Queries.GetPagingRole
{
    public class GetPagingRoleParameter : RequestParameter
    {
        public List<string> id { get; set; }
    }
}
