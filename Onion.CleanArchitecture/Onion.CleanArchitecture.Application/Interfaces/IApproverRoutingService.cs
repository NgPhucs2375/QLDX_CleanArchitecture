using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public interface IApproverRoutingService
    {
        Task<string> GetDepartmentManagerEmailByUserIdAsync(string userId);
    }
}