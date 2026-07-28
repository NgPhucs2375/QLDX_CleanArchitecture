using MassTransit;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Sagas
{
    public class PurchaseRequestSaga : ISaga, SagaStateMachineInstance
    {
        public Guid CorrelationId { get; set; }
        public int RequestId { get; set; }
        public string CurrentState { get; set; }
        public decimal TotalAmount { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
