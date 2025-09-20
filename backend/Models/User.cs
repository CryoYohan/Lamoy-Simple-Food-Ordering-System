using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; }


        // 🔑 Fields for password reset
        public string? PasswordResetToken { get; set; }  // Secure random token
        public DateTime? ResetTokenExpiry { get; set; }  // Expiration date


        // Order reference
        public List<Order> Orders { get; set; } = new List<Order>();
    }
}
