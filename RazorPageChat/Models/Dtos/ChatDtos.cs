using System;
using System.Collections.Generic;

namespace RazorPageChat.Models.Dtos
{
    // 会话相关DTO
    public class ChatSessionDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }

    public class CreateSessionDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Username { get; set; }
    }

    public class UpdateSessionTitleDto
    {
        public string Title { get; set; }
    }

    // 消息相关DTO
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string Sender { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class CreateMessageDto
    {
        public string SessionId { get; set; }
        public string Content { get; set; }
        public string Sender { get; set; }
        public string Username { get; set; }
    }

    // 用户相关DTO
    public class UserLoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public bool RememberMe { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
    }

    // AI聊天相关DTO
    public class ChatRequestDto
    {
        public List<ChatMessageRequestDto> Messages { get; set; }
        public string ApiKey { get; set; }
        public string Endpoint { get; set; }
        public string ModelId { get; set; }
    }

    public class ChatMessageRequestDto
    {
        public string Role { get; set; }
        public string Content { get; set; }
    }

    public class ChatResponseDto
    {
        public string Response { get; set; }
        public bool Success { get; set; }
        public string Error { get; set; }
    }
} 