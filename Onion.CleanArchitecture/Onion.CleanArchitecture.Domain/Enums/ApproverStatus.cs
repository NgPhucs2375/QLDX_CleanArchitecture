namespace Onion.CleanArchitecture.Domain.Enums{
    public enum ApproverStatus
{
    Waiting = 0,    // Chưa tới lượt (Chờ người ở StepOrder trước duyệt)
    Pending = 1,    // Đang tới lượt, chờ hành động
    Approved = 2,   // Đã duyệt
    Rejected = 3,   // Đã từ chối
    Bypassed = 4    // Bị bỏ qua luồng
}
}