using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RazorPageChat.Data.Models;

namespace RazorPageChat.Data
{
    public class ChatDbContext : DbContext, IDataProtectionKeyContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options)
        {
        }

        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 用户与会话关系：一对多
            modelBuilder.Entity<ChatSession>()
                .HasOne<User>()
                .WithMany(u => u.Sessions)
                .HasForeignKey(s => s.Username)
                .HasPrincipalKey(u => u.Username);

            // 会话与消息关系：一对多
            modelBuilder.Entity<ChatMessage>()
                .HasOne<ChatSession>()
                .WithMany(s => s.Messages)
                .HasForeignKey(m => m.SessionId)
                .HasPrincipalKey(s => s.Id);
        }
    }
}
