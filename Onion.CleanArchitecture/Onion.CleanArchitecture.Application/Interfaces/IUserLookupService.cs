using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public interface IUserLookupService
    {
        Task<string> GetDisplayNameAsync(string userId);
    }
}
