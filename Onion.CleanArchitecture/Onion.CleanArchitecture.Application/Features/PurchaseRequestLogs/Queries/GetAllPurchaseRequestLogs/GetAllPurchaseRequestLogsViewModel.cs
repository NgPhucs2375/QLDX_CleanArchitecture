using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs
{
    public class GetAllPurchaseRequestLogsViewModel
    {
        public int Id { get; set; }
        public Guid PurchaseRequestId { get; set; }
        public Guid UserId { get; set; }
        public string Action { get; set; }
        public string Note { get; set; }
    }
}
