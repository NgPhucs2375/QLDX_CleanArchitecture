// using System.Threading;
// using System.Threading.Tasks;
// using Onion.CleanArchitecture.Application.Interfaces.Repositories;
// using Onion.CleanArchitecture.Infrastructure.Persistence.Contexts;
// using Onion.CleanArchiterture.Application.Interfaces.Repositories; // Chứa DbContext

// namespace Onion.CleanArchitecture.Infrastructure.Repositories
// {
//     public class UnitOfWork<TId> : IUnitOfWork<TId>
//     {
//         private readonly ApplicationDbContext _dbContext;

//         public UnitOfWork(ApplicationDbContext dbContext)
//         {
//             _dbContext = dbContext;
//         }

//         public IRepositoryAsync<T, TId> Repository<T>() where T : class, IEntity<TId>
//         {
//             // Logic tạo hoặc trả về một Repository cho Entity T
//             return new RepositoryAsync<T, TId>(_dbContext);
//         }

//         public async Task<int> Commit(CancellationToken cancellationToken)
//         {
//             // Thực thi lưu xuống DB thực tế
//             return await _dbContext.SaveChangesAsync(cancellationToken);
//         }

//         public Task Rollback()
//         {
//             // Logic hoàn tác (nếu cần)
//             return Task.CompletedTask;
//         }

//         public void Dispose()
//         {
//             _dbContext.Dispose();
//         }
//     }
// }