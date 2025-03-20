using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorPageChat.Data;
using RazorPageChat.Data.Models;
using RazorPageChat.Models.Dtos;
using RazorPageChat.Services;
using System;
using System.Threading.Tasks;

namespace RazorPageChat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UserController(ChatDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(UserLoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null)
            {
                // 演示模式：如果是特定的演示账号，自动创建账户
                if (loginDto.Username == "demo" && loginDto.Password == "demo")
                {
                    return await CreateDemoUser();
                }
                return Unauthorized("用户名或密码错误");
            }

            if (!_passwordHasher.VerifyPassword(user.PasswordHash, loginDto.Password))
            {
                return Unauthorized("用户名或密码错误");
            }

            // 更新最后登录时间
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(UserLoginDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return Conflict("用户名已存在");
            }

            var user = new User
            {
                Username = registerDto.Username,
                PasswordHash = _passwordHasher.HashPassword(registerDto.Password),
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Login), new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email
            });
        }

        private async Task<ActionResult<UserDto>> CreateDemoUser()
        {
            // 检查是否已存在演示用户
            var demoUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == "demo");

            if (demoUser != null)
            {
                demoUser.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new UserDto
                {
                    Id = demoUser.Id,
                    Username = demoUser.Username,
                    Email = demoUser.Email
                });
            }

            // 创建新的演示用户
            var newDemoUser = new User
            {
                Username = "demo",
                PasswordHash = _passwordHasher.HashPassword("demo"),
                Email = "demo@example.com",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            _context.Users.Add(newDemoUser);
            await _context.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = newDemoUser.Id,
                Username = newDemoUser.Username,
                Email = newDemoUser.Email
            });
        }
    }
} 