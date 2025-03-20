using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RazorPageChat.Data.Models
{
    public class ChatSession
    {
        [Key]
        public string Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        public DateTime LastUpdatedAt { get; set; }
        
        [Required]
        public string Username { get; set; }
        
        // 导航属性
        public ICollection<ChatMessage> Messages { get; set; }
    }
} 