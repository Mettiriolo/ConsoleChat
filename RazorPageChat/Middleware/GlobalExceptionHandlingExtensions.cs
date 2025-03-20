using Microsoft.AspNetCore.Builder;

namespace RazorPageChat.Middleware
{
    public static class GlobalExceptionHandlingExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
        }
    }
} 