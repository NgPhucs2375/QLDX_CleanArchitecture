using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
using Onion.CleanArchitecture.Infrastructure.Persistence.Repository;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Repositories
{
    public class PurchaseRequestApproverRepositoryAsync : GenericRepositoryAsync<PurchaseRequestApprover>, IPurchaseRequestApproverRepositoryAsync
    {
        public PurchaseRequestApproverRepositoryAsync(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
