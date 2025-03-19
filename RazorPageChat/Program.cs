using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using RazorPageChat.Data;

namespace RazorPageChat
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddRazorPages();

            string connectionString = $"server={Environment.GetEnvironmentVariable("MYSQL_ADDRESS")};database=chat_db;user={Environment.GetEnvironmentVariable("MYSQL_USERNAME")};password={Environment.GetEnvironmentVariable("MYSQL_PASSWORD")}";

            var serverVersion = new MySqlServerVersion(new Version(5, 7, 0));
            builder.Services.AddDbContext<ChatDbContext>(options =>
            {
                options.UseMySql(connectionString, serverVersion);
            });

            builder.Services.AddDataProtection()
                            .PersistKeysToDbContext<ChatDbContext>()
                            .SetApplicationName("RazorPageChat")            // 确保同一应用使用相同的密钥
                            .SetDefaultKeyLifetime(TimeSpan.FromDays(90)); // 90 天密钥轮换

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapRazorPages();

            app.Run();
        }
    }
}
