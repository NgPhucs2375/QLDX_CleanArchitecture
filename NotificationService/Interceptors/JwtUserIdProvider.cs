// SignalR cần biết UserId từ JWT token để map connection -> userId.
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;

namespace Onion.CleanArchitecture.NotificationService.Interceptors
{
    public class JwtUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext conect)
        {
            var userId = conect.User?.FindFirst("uid")?.Value;
            if (!string.IsNullOrEmpty(userId))
                return userId;

            return conect.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

    }
}