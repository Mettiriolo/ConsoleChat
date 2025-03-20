using Microsoft.AspNetCore.Mvc;
using RazorPageChat.Models.Dtos;
using RazorPageChat.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RazorPageChat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IChatService _chatService;

        public AIController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<ChatResponseDto>> Chat(ChatRequestDto request)
        {
            if (string.IsNullOrEmpty(request.ApiKey))
            {
                return BadRequest("API密钥不能为空");
            }

            if (request.Messages == null || request.Messages.Count == 0)
            {
                return BadRequest("消息列表不能为空");
            }

            var config = new ChatConfig
            {
                ApiKey = request.ApiKey,
                Endpoint = request.Endpoint ?? "https://api.deepseek.com/v1/chat/completions",
                ModelId = request.ModelId ?? "deepseek-chat"
            };

            try
            {
                var chatMessages = new List<ChatMessage>();
                foreach (var msg in request.Messages)
                {
                    chatMessages.Add(new ChatMessage
                    {
                        Role = msg.Role,
                        Content = msg.Content
                    });
                }

                string response = await _chatService.GetChatCompletionAsync(chatMessages, config);

                return Ok(new ChatResponseDto
                {
                    Response = response,
                    Success = true
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new ChatResponseDto
                {
                    Response = null,
                    Success = false,
                    Error = ex.Message
                });
            }
        }
    }
} 