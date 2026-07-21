// using System;
// using System.Threading;
// using System.Threading.Tasks;

// namespace Onion.CleanArchiterture.Application.Interfaces.Repositories{
//     public interface IUnitOfWork<TId> : IDisposable{
//         //Lay Repository tuong ung voi Entity
//         IRepositoryAsync<T,TId> Repository<T>() where T : class, IEntity<TId>;
//         //Save all change to DB (SaveChangeAsync)
//         Task<int> Commit(CancellationToken cancellationToken);
//         //Rollback if have error
//         Task Rollback();
//     }
// }