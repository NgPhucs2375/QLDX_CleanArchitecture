using FluentValidation;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Departments.Commands.CreateDepartment
{
    public class CreateDepartmentCommandValidator : AbstractValidator<CreateDepartmentCommand>
    {
        private readonly IDepartmentRepositoryAsync _departmentRepository;

        public CreateDepartmentCommandValidator(IDepartmentRepositoryAsync departmentRepository)
        {
            _departmentRepository = departmentRepository;

            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.")
                .MustAsync(IsUniqueCode).WithMessage("{PropertyName} already exists.");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.");
        }

        private async Task<bool> IsUniqueCode(string code, CancellationToken cancellationToken)
        {
            return await _departmentRepository.IsUniqueCodeAsync(code);
        }
    }
}
