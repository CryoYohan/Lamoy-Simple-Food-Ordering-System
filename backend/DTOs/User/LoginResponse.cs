using backend.Models;

namespace backend.DTOs.User
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string UserName { get; set; } = string.Empty;
    }
}