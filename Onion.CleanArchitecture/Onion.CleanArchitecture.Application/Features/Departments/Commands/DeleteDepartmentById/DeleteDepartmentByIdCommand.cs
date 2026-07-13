using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Departments.Commands.DeleteDepartmentById
{
    public class DeleteDepartmentByIdCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public class DeleteDepartmentByIdCommandHandler : IRequestHandler<DeleteDepartmentByIdCommand, Response<int>>
        {
            private readonly IDepartmentRepositoryAsync _departmentRepository;
            public DeleteDepartmentByIdCommandHandler(IDepartmentRepositoryAsync departmentRepository)
            {
                _departmentRepository = departmentRepository;
            }
            public async Task<Response<int>> Handle(DeleteDepartmentByIdCommand command, CancellationToken cancellationToken)
            {
                var department = await _departmentRepository.GetByIdAsync(command.Id);
                if (department == null) throw new ApiException($"Department Not Found.");
                await _departmentRepository.DeleteAsync(department);
                return new Response<int>(department.Id);
            }
        }
    }
}
