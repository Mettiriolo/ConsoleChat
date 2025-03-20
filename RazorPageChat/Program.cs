using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RazorPageChat.Data;
using RazorPageChat.Middleware;
using RazorPageChat.Services;
using System;
using System.Threading.Tasks;

namespace RazorPageChat
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 配置日志
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();

            // 添加服务到容器
            builder.Services.AddRazorPages();
            builder.Services.AddControllers();

            // 读取配置
            var configuration = builder.Configuration;
            string connectionString = configuration.GetConnectionString("DefaultConnection")!;

            // 配置数据库上下文
            var serverVersion = new MySqlServerVersion(new Version(5, 7, 40));
            builder.Services.AddDbContext<ChatDbContext>(options =>
            {
                options.UseMySql(connectionString, serverVersion,options=>options.EnableRetryOnFailure())
                       .EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
            });

            // 配置数据保护
            builder.Services.AddDataProtection()
                            .PersistKeysToDbContext<ChatDbContext>()
                            .SetApplicationName("RazorPageChat")
                            .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

            // 注册HttpClient工厂
            builder.Services.AddHttpClient();

            // 注册应用服务
            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            builder.Services.AddScoped<IChatService, DeepseekChatService>();

            var app = builder.Build();

            // 应用数据库迁移
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            await DbInitializer.InitializeAsync(app.Services, logger);

            // 配置HTTP请求管道
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }
            else
            {
                app.UseDeveloperExceptionPage();
            }

            // 全局异常处理中间件
            app.UseGlobalExceptionHandling();

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapRazorPages();
            app.MapControllers();

            await app.RunAsync();
        }
    }
}
