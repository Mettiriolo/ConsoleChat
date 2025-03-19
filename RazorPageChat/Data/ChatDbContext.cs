using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace RazorPageChat.Data
{
    public class ChatDbContext: DbContext,IDataProtectionKeyContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options):base(options) 
        {
        }
        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
    }
}
