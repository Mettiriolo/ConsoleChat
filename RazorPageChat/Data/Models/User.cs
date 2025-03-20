using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RazorPageChat.Data.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        public string Email { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime LastLoginAt { get; set; }
        
        // 导航属性
        public ICollection<ChatSession> Sessions { get; set; }
    }
} 