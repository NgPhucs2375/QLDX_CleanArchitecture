using Onion.CleanArchitecture.Domain.Enums;
using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests
{
    public class GetAllPurchaseRequestsViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid PurchaseConfigId { get; set; }
        public PurchaseRequestStatus Status { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal TotalActualAmount { get; set; }
    }
}
