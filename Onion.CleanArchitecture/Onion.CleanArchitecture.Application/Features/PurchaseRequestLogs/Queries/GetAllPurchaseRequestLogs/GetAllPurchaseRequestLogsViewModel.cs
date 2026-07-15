using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs
{
    public class GetAllPurchaseRequestLogsViewModel
    {
        public int Id { get; set; }
        public int PurchaseRequestId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Action { get; set; }
        public string Note { get; set; }
    }
}
