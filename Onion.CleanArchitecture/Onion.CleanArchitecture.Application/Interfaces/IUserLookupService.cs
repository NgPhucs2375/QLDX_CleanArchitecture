using System.Collections.Generic;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public class UserDepartmentInfo
    {
        public string UserId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
    }

    public interface IUserLookupService
    {
        Task<string> GetDisplayNameAsync(string userId);
        Task<List<UserDepartmentInfo>> GetUsersByDepartmentIdAsync(int departmentId);
    }
}
