using FluentValidation;
using Onion.CleanArchitecture.Application.Features.TriggerPurchaseRequest.Commands.TriggerPurchaseRequestCommand;
using System.Linq;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.TriggerPurchaseRequest
{
    public class TriggerPurchaseRequestCommandValidator : AbstractValidator<TriggerPurchaseRequestCommand>
    {
        public TriggerPurchaseRequestCommandValidator()
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("ID phiếu không hợp lệ.");

            RuleFor(p => p.Action)
                .NotEmpty().WithMessage("Hành động (Action) không được để trống.")
                .Must(BeAValidAction).WithMessage("Action chỉ được phép là: approve, reject, return, confirm.");

            // Bắt buộc nhập Note nếu Action là reject hoặc return
            RuleFor(p => p.Note)
                .NotEmpty()
                .When(p => p.Action?.ToLower() == "reject" || p.Action?.ToLower() == "return")
                .WithMessage("Bắt buộc phải nhập lý do (Note) khi Từ chối hoặc Yêu cầu sửa đổi.");
        }

        private bool BeAValidAction(string action)
        {
            var validActions = new[] { "approve", "reject", "return", "confirm","submit" };
            return validActions.Contains(action?.ToLower());
        }
    }
}