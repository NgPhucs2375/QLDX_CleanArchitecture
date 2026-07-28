using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    public class AuditLogConsumer :
        IConsumer<PurchaseRequestSubmittedEvent>,
        IConsumer<PurchaseRequestDepartmentApprovedEvent>,
        IConsumer<PurchaseRequestDepartmentRejectedEvent>,
        IConsumer<PurchaseRequestControlApprovedEvent>,
        IConsumer<PurchaseRequestControlRejectedEvent>,
        IConsumer<PurchaseRequestReturnedForEditEvent>,
        IConsumer<PurchaseRequestOrderConfirmedEvent>
    {
        private readonly ILogger<AuditLogConsumer> _logger;

        public AuditLogConsumer(ILogger<AuditLogConsumer> logger)
        {
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestSubmittedEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - Người gửi {SubmittedBy} - Gửi duyệt lúc {OccurredAt}",
                m.RequestId, m.SubmittedBy, m.OccurredAt);
            await Task.CompletedTask;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestDepartmentApprovedEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - Trưởng đơn vị {ApprovedBy} duyệt lúc {ApprovedAt}",
                m.RequestId, m.ApprovedBy, m.ApprovedAt);
            await Task.CompletedTask;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestDepartmentRejectedEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - Trưởng đơn vị {RejectedBy} từ chối lúc {OccurredAt}. Lý do: {Note}",
                m.RequestId, m.RejectedBy, m.OccurredAt, m.Note);
            await Task.CompletedTask;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestControlApprovedEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - Kiểm soát {ApprovedBy} duyệt lúc {OccurredAt}",
                m.RequestId, m.ApprovedBy, m.OccurredAt);
            await Task.CompletedTask;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestControlRejectedEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - Kiểm soát {RejectedBy} từ chối lúc {OccurredAt}. Lý do: {Note}",
                m.RequestId, m.RejectedBy, m.OccurredAt, m.Note);
            await Task.CompletedTask;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestReturnedForEditEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - {ReturnedBy} trả về sửa lúc {ReturnAt}. Lý do: {Note}",
                m.RequestId, m.ReturnedBy, m.ReturnAt, m.Note);
            await Task.CompletedTask;
        }

        public async Task Consume(ConsumeContext<PurchaseRequestOrderConfirmedEvent> context)
        {
            var m = context.Message;
            _logger.LogInformation("[AUDIT] Phiếu {RequestId} - {ConfirmedBy} xác nhận đơn hàng hoàn thành lúc {ConfirmedAt}",
                m.RequestId, m.ConfirmedBy, m.ConfirmedAt);
            await Task.CompletedTask;
        }
    }
}
