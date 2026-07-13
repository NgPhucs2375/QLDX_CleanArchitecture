using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Departments.Commands.UpdateDepartment
{
    public class UpdateDepartmentCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public Guid? ManagerId { get; set; }
        public bool IsActive { get; set; }

        public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Response<int>>
        {
            private readonly IDepartmentRepositoryAsync _departmentRepository;
            public UpdateDepartmentCommandHandler(IDepartmentRepositoryAsync departmentRepository)
            {
                _departmentRepository = departmentRepository;
            }
            public async Task<Response<int>> Handle(UpdateDepartmentCommand command, CancellationToken cancellationToken)
            {
                var department = await _departmentRepository.GetByIdAsync(command.Id);
                if (department == null)
                {
                    throw new ApiException($"Department Not Found.");
                }
                else
                {
                    department.Code = command.Code;
                    department.Name = command.Name;
                    department.ManagerId = command.ManagerId;
                    department.IsActive = command.IsActive;
                    await _departmentRepository.UpdateAsync(department);
                    return new Response<int>(department.Id);
                }
            }
        }
    }
}
