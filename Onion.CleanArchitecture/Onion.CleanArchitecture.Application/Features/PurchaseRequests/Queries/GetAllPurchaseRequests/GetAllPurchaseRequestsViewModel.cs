using Onion.CleanArchitecture.Domain.Enums;
using System;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests
{
    public class GetAllPurchaseRequestsViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public int DepartmentId { get; set; }
        public int PurchaseConfigId { get; set; }
        public PurchaseRequestStatus Status { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal TotalActualAmount { get; set; }
    }
}
