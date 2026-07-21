using MediatR;
using Onion.CleanArchitecture.Domain.Enums;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Events{
    public class PurchaseRequestProcessedEvent : INotification
    {
        public int PurchaseRequestId { get;set;}
        public string ApproverId {get;set;}
        public string ApproverName {get; set;}
        public PurchaseRequestStatus FromStatus {get;set;}
        public PurchaseRequestStatus ToStatus {get;set;}
        public string Action {get;set;}
        public string Note {get;set;}
    }
}