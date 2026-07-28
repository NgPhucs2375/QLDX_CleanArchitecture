namespace Onion.CleanArchitecture.EmailService.Data
{
    using System;

    /// <summary>
    /// Lưu thông tin email của user để gửi email
    /// </summary>
public class UserEmail
{
    public string Id { get; set; }         // UserId từ Identity
    public string Email { get; set; }
    public string DisplayName { get; set; }
    public DateTime LastSyncedAt { get; set; }
}}