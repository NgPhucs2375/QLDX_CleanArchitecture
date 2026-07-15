using FluentValidation;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest
{
    public class CreatePurchaseRequestCommandValidator : AbstractValidator<CreatePurchaseRequestCommand>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;

        public CreatePurchaseRequestCommandValidator(IPurchaseRequestRepositoryAsync purchaseRequestRepository)
        {
            _purchaseRequestRepository = purchaseRequestRepository;

            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.")
                .MustAsync(IsUniqueCode).WithMessage("{PropertyName} already exists.");

            RuleFor(p => p.DepartmentId)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.ProposalConfigId)
                .NotEmpty().WithMessage("{PropertyName} is required.");
        }

        private async Task<bool> IsUniqueCode(string code, CancellationToken cancellationToken)
        {
            return await _purchaseRequestRepository.IsUniqueCodeAsync(code);
        }
    }
}
