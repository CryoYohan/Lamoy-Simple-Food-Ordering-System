using backend.DTOs.User;
using backend.Models;
using backend.Repositories;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Net;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly EmailService _emailService;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository, 
            EmailService emailService, 
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
        {
            _logger.LogInformation("Password reset requested for email: {Email}", request.Email);
            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            if (user == null)
            {
                _logger.LogWarning("Password reset for {Email} failed: User not found.", request.Email);
                // We don't throw an exception here.
                // For security, you should NOT tell the client if the email exists or not.
                // We just silently succeed.
                return;
            }

            // Generate secure token
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.PasswordResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1-hour expiry

            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Generated password reset token for User {UserId}", user.UserId);

            // Link to your frontend page
            var encodedToken = WebUtility.UrlEncode(token);
            var resetLink = $"http://localhost:5173/reset-password?token={encodedToken}";
            var body = $@"
                <p>Hello {user.UserName},</p>
                <p>Click the link below to reset your password:</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>This link expires in 1 hour.</p>";

            await _emailService.SendEmailAsync(user.Email, "Password Reset Request", body);
            _logger.LogInformation("Password reset email sent to {Email}", user.Email);
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            _logger.LogInformation("Attempting to reset password with token: {Token}", request.Token);
            var user = await _userRepository.GetUserByPasswordResetTokenAsync(request.Token);

            if (user == null)
            {
                _logger.LogWarning("Password reset failed: Invalid or expired token {Token}", request.Token);
                throw new InvalidOperationException("Invalid or expired token.");
            }

            // Hash the new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // Clear reset token fields
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _userRepository.SaveChangesAsync();

            _logger.LogInformation("Password reset successful for User {UserId}", user.UserId);
        }

        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            _logger.LogInformation("Fetching user by ID: {UserId}", id);
            var user = await _userRepository.GetUserByIdAsync(id);

            if (user == null)
            {
                _logger.LogWarning("Failed to fetch user: User with ID {UserId} not found.", id);
                throw new KeyNotFoundException("User not found.");
            }
            
            return MapToUserDto(user);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            _logger.LogInformation("Fetching all users");
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(MapToUserDto);
        }

        // --- Helper Mapping Method ---
        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                UserName = user.UserName,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }
    }
}