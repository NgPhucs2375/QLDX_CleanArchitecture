using FluentValidation;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.CreateProposalConfig
{
    public class CreateProposalConfigCommandValidator : AbstractValidator<CreateProposalConfigCommand>
    {
        private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;

        public CreateProposalConfigCommandValidator(IProposalConfigRepositoryAsync proposalConfigRepository)
        {
            _proposalConfigRepository = proposalConfigRepository;

            RuleFor(p => p.Code)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.")
                .MustAsync(IsUniqueCode).WithMessage("{PropertyName} already exists.");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.");

            RuleFor(p => p.EffectiveDate)
                .NotEmpty().WithMessage("{PropertyName} is required.");
        }

        private async Task<bool> IsUniqueCode(string code, CancellationToken cancellationToken)
        {
            return await _proposalConfigRepository.IsUniqueCodeAsync(code);
        }
    }
}
