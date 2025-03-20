using System;
using System.ComponentModel.DataAnnotations;

namespace RazorPageChat.Data.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string SessionId { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        [Required]
        public string Sender { get; set; } // "user" 或 "assistant"
        
        [Required]
        public DateTime Timestamp { get; set; }
        
        public string Username { get; set; }
    }
} 