using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace RazorPageChat.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ChatDbContext>();

            try
            {
                logger.LogInformation("开始应用数据库迁移...");

                // 确保数据库已创建并应用所有迁移
                if (context.Database.IsMySql())
                {
                    await context.Database.MigrateAsync();
                    logger.LogInformation("数据库迁移成功应用");
                }
                else
                {
                    logger.LogWarning("数据库不是MySQL，跳过自动迁移");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "应用数据库迁移时发生错误");
                throw;
            }
        }
    }
} 