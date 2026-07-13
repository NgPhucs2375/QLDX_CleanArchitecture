using FluentValidation;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Products.Commands.CreateProduct
{
    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        private readonly IProductRepositoryAsync productRepository;

        public CreateProductCommandValidator(IProductRepositoryAsync productRepository)
        {
            this.productRepository = productRepository;

            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.")
                .MustAsync(IsUniqueCode).WithMessage("{PropertyName} already exists.");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

            RuleFor(p => p.CategoryId)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotEqual(Guid.Empty).WithMessage("{PropertyName} must be a valid GUID.");

            RuleFor(p => p.UnitPrice)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .GreaterThanOrEqualTo(0).WithMessage("{PropertyName} must be greater than or equal to 0.");

            // 5. Kiểm tra Đơn vị tính (Unit)
            RuleFor(p => p.Unit)
                .NotEmpty().WithMessage("Đơn vị tính không được để trống.")
                .MaximumLength(20).WithMessage("Đơn vị tính không được vượt quá 20 ký tự (VD: Cái, Chiếc, Hộp).");

        }

        private async Task<bool> IsUniqueCode(string Code, CancellationToken cancellationToken)
        {
            return await productRepository.IsUniqueCodeAsync(Code);
        }
    }
}
