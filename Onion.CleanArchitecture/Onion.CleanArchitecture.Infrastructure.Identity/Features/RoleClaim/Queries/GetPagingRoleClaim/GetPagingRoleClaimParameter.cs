using System;
using System.Collections.Generic;
using Onion.CleanArchitecture.Application.Filters;

namespace Onion.CleanArchitecture.Infrastructure.Identity
{
    public class GetPagingRoleClaimParameter : RequestParameter
    {
        public List<int> id { get; set; }
    }
}
