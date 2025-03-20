using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RazorPageChat.Data;
using RazorPageChat.Data.Models;
using RazorPageChat.Models.Dtos;

namespace RazorPageChat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ChatDbContext _context;

        public ChatController(ChatDbContext context)
        {
            _context = context;
        }

        // 获取用户的所有会话
        [HttpGet("sessions/{username}")]
        public async Task<ActionResult<IEnumerable<ChatSessionDto>>> GetSessions(string username)
        {
            var sessions = await _context.ChatSessions
                .Where(s => s.Username == username)
                .OrderByDescending(s => s.LastUpdatedAt)
                .Select(s => new ChatSessionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    CreatedAt = s.CreatedAt,
                    LastUpdatedAt = s.LastUpdatedAt
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // 获取特定会话的所有消息
        [HttpGet("messages/{sessionId}")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetMessages(string sessionId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    Sender = m.Sender,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            return Ok(messages);
        }

        // 创建新会话
        [HttpPost("sessions")]
        public async Task<ActionResult<ChatSessionDto>> CreateSession(CreateSessionDto dto)
        {
            var session = new ChatSession
            {
                Id = dto.Id ?? Guid.NewGuid().ToString(),
                Title = dto.Title,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow,
                Username = dto.Username
            };

            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSessions), new { username = dto.Username }, 
                new ChatSessionDto
                {
                    Id = session.Id,
                    Title = session.Title,
                    CreatedAt = session.CreatedAt,
                    LastUpdatedAt = session.LastUpdatedAt
                });
        }

        // 保存消息
        [HttpPost("messages")]
        public async Task<ActionResult<ChatMessageDto>> SaveMessage(CreateMessageDto dto)
        {
            // 更新会话的最后更新时间
            var session = await _context.ChatSessions.FindAsync(dto.SessionId);
            if (session == null)
            {
                return NotFound($"会话ID {dto.SessionId} 不存在");
            }

            session.LastUpdatedAt = DateTime.UtcNow;
            
            // 如果是第一条消息，更新会话标题
            if (!await _context.ChatMessages.AnyAsync(m => m.SessionId == dto.SessionId) && 
                dto.Sender == "user")
            {
                session.Title = dto.Content.Length > 30 
                    ? dto.Content.Substring(0, 30) + "..." 
                    : dto.Content;
            }

            var message = new ChatMessage
            {
                SessionId = dto.SessionId,
                Content = dto.Content,
                Sender = dto.Sender,
                Timestamp = DateTime.UtcNow,
                Username = dto.Username
            };

            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMessages), new { sessionId = dto.SessionId },
                new ChatMessageDto
                {
                    Id = message.Id,
                    Content = message.Content,
                    Sender = message.Sender,
                    Timestamp = message.Timestamp
                });
        }

        // 删除会话
        [HttpDelete("sessions/{id}")]
        public async Task<IActionResult> DeleteSession(string id)
        {
            var session = await _context.ChatSessions.FindAsync(id);
            if (session == null)
            {
                return NotFound();
            }

            // 删除会话的所有消息
            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == id)
                .ToListAsync();

            _context.ChatMessages.RemoveRange(messages);
            _context.ChatSessions.Remove(session);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 更新会话标题
        [HttpPut("sessions/{id}/title")]
        public async Task<IActionResult> UpdateSessionTitle(string id, UpdateSessionTitleDto dto)
        {
            var session = await _context.ChatSessions.FindAsync(id);
            if (session == null)
            {
                return NotFound();
            }

            session.Title = dto.Title;
            session.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 