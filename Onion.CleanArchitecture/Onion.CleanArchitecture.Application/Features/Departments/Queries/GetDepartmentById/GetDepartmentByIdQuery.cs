using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Departments.Queries.GetDepartmentById
{
    public class GetDepartmentByIdQuery : IRequest<Response<Department>>
    {
        public int Id { get; set; }
        public class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, Response<Department>>
        {
            private readonly IDepartmentRepositoryAsync _departmentRepository;
            public GetDepartmentByIdQueryHandler(IDepartmentRepositoryAsync departmentRepository)
            {
                _departmentRepository = departmentRepository;
            }
            public async Task<Response<Department>> Handle(GetDepartmentByIdQuery query, CancellationToken cancellationToken)
            {
                var department = await _departmentRepository.GetByIdAsync(query.Id);
                if (department == null) throw new ApiException($"Department Not Found.");
                return new Response<Department>(department);
            }
        }
    }
}
