using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using RazorPageChat.Data;
using RazorPageChat.Data.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RazorPageChat.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly ChatDbContext _context;

        public IndexModel(ILogger<IndexModel> logger, ChatDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public bool IsAuthenticated { get; private set; }
        public string Username { get; private set; }
        
        public async Task<IActionResult> OnGetAsync()
        {
            // 在实际应用中，这里应该检查用户是否已经登录
            // 如果用户未登录，应该重定向到登录页面
            // 简化处理，实际验证逻辑会在前端JavaScript中处理
            
            return Page();
        }
    }
}
