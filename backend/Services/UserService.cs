using backend.DTOs.User;
using backend.Models;
using backend.Repositories;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Net;
// 1. Add required using statements
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly EmailService _emailService;
        private readonly ILogger<UserService> _logger;
        // 2. Add IHttpContextAccessor field
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(
            IUserRepository userRepository, 
            EmailService emailService, 
            ILogger<UserService> logger,
            // 3. Inject IHttpContextAccessor
            IHttpContextAccessor httpContextAccessor) 
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _logger = logger;
            // 4. Assign it
            _httpContextAccessor = httpContextAccessor; 
        }

        // 5. Add private helper to get user ID from token claims
        private int GetAuthenticatedUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("userId");
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Could not parse user ID from claims.");
                throw new UnauthorizedAccessException("User is not properly authenticated or UserId claim is missing.");
            }
            return userId;
        }

        public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
        {
            _logger.LogInformation("Password reset requested for email: {Email}", request.Email);
            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            if (user == null)
            {
                _logger.LogWarning("Password reset for {Email} failed: User not found.", request.Email);
                return;
            }

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.PasswordResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Link expires after 1 hour

            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Generated password reset token for User {UserId}", user.UserId);

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

            // Check if the new password is the same as the current password
            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            {
                _logger.LogWarning("Password reset failed: New password is the same as current password for User {UserId}", user.UserId);
                throw new InvalidOperationException("You cannot use the same password as your current password.");
            }

            // Check if password contains at least 1 capital letter
            if (!System.Text.RegularExpressions.Regex.IsMatch(request.NewPassword, "[A-Z]"))
            {
                _logger.LogWarning("Password reset failed: Password must contain at least 1 capital letter for User {UserId}", user.UserId);
                throw new InvalidOperationException("Password must contain at least 1 capital letter.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _userRepository.SaveChangesAsync();

            _logger.LogInformation("Password reset successful for User {UserId}", user.UserId);
        }

        // This is for Admins to get any user
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

        // This is for Admins
        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            _logger.LogInformation("Fetching all users");
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(MapToUserDto);
        }

        
        // --- 6. UPDATED PROFILE METHODS ---

        // Gets the profile for the *currently logged-in* user
        public async Task<UserDto> GetUserProfileAsync()
        {
            var userId = GetAuthenticatedUserId(); // Get ID from token
            _logger.LogInformation("Fetching profile for authenticated User {UserId}", userId);
            
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogError("Authenticated User {UserId} not found in database.", userId);
                throw new KeyNotFoundException("User profile not found.");
            }
            return MapToUserDto(user);
        }

        // Updates the profile for the *currently logged-in* user
        public async Task<UserDto> UpdateUserProfileAsync(UserUpdateDto dto)
        {
            var userId = GetAuthenticatedUserId(); // Get ID from token
            _logger.LogInformation("Attempting to update profile for User {UserId}", userId);

            // 1. Fetch the user
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Profile update failed: User with ID {UserId} not found.", userId);
                throw new KeyNotFoundException("User not found.");
            }

            // 2. Map the updated fields from the DTO to the entity
            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Address = dto.Address;
            // Note: Email/UserName changes are not handled here

            // 3. Save the changes to the database
            await _userRepository.SaveChangesAsync();

            _logger.LogInformation("Profile updated successfully for User {UserId}", userId);

            // 4. Return the updated user data
            return MapToUserDto(user);
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
