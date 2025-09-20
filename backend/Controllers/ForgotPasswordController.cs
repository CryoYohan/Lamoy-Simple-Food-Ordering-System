using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Net;

namespace backend.Controllers
{
    [Route("api/forgot-password")]
    [ApiController]
    public class ForgotPasswordController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly EmailService _emailService;

        public ForgotPasswordController(ApplicationDBContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("request")]
        public async Task<IActionResult> RequestReset([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound("User with this email does not exist.");

            // Generate secure token
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.PasswordResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            // Link to your frontend page
            var encodedToken = WebUtility.UrlEncode(token); // <-- encode the token
            var resetLink = $"http://localhost:5173/reset-password?token={encodedToken}";
            var body = $@"
                <p>Hello {user.UserName},</p>
                <p>Click the link below to reset your password:</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>This link expires in 1 hour.</p>";

            await _emailService.SendEmailAsync(user.Email, "Password Reset Request", body);

            return Ok(new { message = "Password reset link sent to your email." });
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == request.Token &&
                u.ResetTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return BadRequest("Invalid or expired token.");

            // ⚠️ In production, use a password hasher instead of plain text
            user.PasswordHash = request.NewPassword;
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successful. You can now log in." });
        }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
