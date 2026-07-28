namespace Onion.CleanArchitecture.NotificationService.Models
{
    public class NotificationMessage
    {
        public string Type { get; set; } = "info";
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public int RequestId { get; set; }
        public string? ActionUrl { get; set; } // link toi phieu
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}