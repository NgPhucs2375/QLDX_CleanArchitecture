namespace Onion.CleanArchitecture.Domain.Enums
{
    public enum PurchaseRequestAction
    {
        // Tao
        Created = 1,
        //Chinh sua
        Updated = 2,
        //Duyet
        Approved = 3,
        //Tu choi
        Rejected = 4,
        //Tra chinh sua
        ReturnedForEdit = 5,
        // Xac nhan don hang
        OrderConfirmed = 6,
        //Cap nhat so luong thuc te
        ActualQuantityUpdated = 7,
    }
}