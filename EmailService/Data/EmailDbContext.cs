using Microsoft.EntityFrameworkCore;
using Onion.CleanArchitecture.EmailService.Data;

namespace Onion.CleanArchitecture.Application.Contracts
{
    public class EmailDbContext : DbContext
{
    public DbSet<UserEmail> UserEmails { get; set; }
    
    public EmailDbContext(DbContextOptions<EmailDbContext> options) : base(options) { }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserEmail>(entity =>
        {
            entity.ToTable("UserEmails");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.DisplayName).HasMaxLength(256);
        });
    }
}}