namespace Onion.CleanArchitecture.NotificationService.Models
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int RequestId { get; set; }
        public string? ActionUrl { get; set; } // link toi phieu
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}