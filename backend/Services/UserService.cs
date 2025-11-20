using backend.Constants;
using backend.DTOs.User;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly EmailService _emailService;
        private readonly ILogger<UserService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(
            IUserRepository userRepository,
            EmailService emailService,
            ILogger<UserService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetAuthenticatedUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                               ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(AppConstants.Claims.UserId);

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning(AppConstants.Logs.InvalidUserIdClaim);
                throw new UnauthorizedAccessException(AppConstants.Errors.Unauthorized);
            }
            return userId;
        }

        public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
        {
            _logger.LogInformation(AppConstants.Logs.PasswordResetRequested, request.Email);
            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            if (user == null)
            {
                _logger.LogWarning(AppConstants.Logs.PasswordResetUserNotFound, request.Email);
                return;
            }

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.PasswordResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _userRepository.SaveChangesAsync();
            _logger.LogInformation(AppConstants.Logs.PasswordResetTokenGenerated, user.UserId);

            var encodedToken = WebUtility.UrlEncode(token);
            var resetLink = $"{AppConstants.Urls.ResetPasswordPage}?token={encodedToken}";
            var body = $@"
                <p>Hello {user.UserName},</p>
                <p>{AppConstants.Messages.PasswordResetEmailBody}</p>
                <p><a href='{resetLink}'>Reset Password</a></p>
                <p>{AppConstants.Messages.PasswordResetExpiryNotice}</p>";

            await _emailService.SendEmailAsync(user.Email, AppConstants.Messages.PasswordResetSubject, body);
            _logger.LogInformation(AppConstants.Logs.PasswordResetEmailSent, user.Email);
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            _logger.LogInformation(AppConstants.Logs.PasswordResetAttempt, request.Token);
            var user = await _userRepository.GetUserByPasswordResetTokenAsync(request.Token);

            if (user == null)
            {
                _logger.LogWarning(AppConstants.Logs.PasswordResetInvalidToken, request.Token);
                throw new InvalidOperationException(AppConstants.Errors.InvalidToken);
            }

            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            {
                _logger.LogWarning(AppConstants.Logs.PasswordResetSameAsOld, user.UserId);
                throw new InvalidOperationException(AppConstants.Errors.PasswordSameAsOld);
            }

            if (!Regex.IsMatch(request.NewPassword, "[A-Z]"))
            {
                _logger.LogWarning(AppConstants.Logs.PasswordResetMissingCapital, user.UserId);
                throw new InvalidOperationException(AppConstants.Errors.PasswordMustContainCapital);
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _userRepository.SaveChangesAsync();
            _logger.LogInformation(AppConstants.Logs.PasswordResetSuccess, user.UserId);
        }

        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            _logger.LogInformation(AppConstants.Logs.FetchUserById, id);
            var user = await _userRepository.GetUserByIdAsync(id);

            if (user == null)
            {
                _logger.LogWarning(AppConstants.Logs.FetchUserNotFound, id);
                throw new KeyNotFoundException(AppConstants.Errors.UserNotFound);
            }

            return MapToUserDto(user);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            _logger.LogInformation(AppConstants.Logs.FetchAllUsers);
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(MapToUserDto);
        }

        public async Task<UserDto> GetUserProfileAsync()
        {
            var userId = GetAuthenticatedUserId();
            _logger.LogInformation(AppConstants.Logs.FetchUserProfile, userId);

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogError(AppConstants.Logs.UserProfileNotFound, userId);
                throw new KeyNotFoundException(AppConstants.Errors.UserNotFound);
            }

            return MapToUserDto(user);
        }

        public async Task<UserDto> UpdateUserProfileAsync(UserUpdateDto dto)
        {
            var userId = GetAuthenticatedUserId();
            _logger.LogInformation(AppConstants.Logs.UpdateUserProfileAttempt, userId);

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning(AppConstants.Logs.UpdateUserProfileUserNotFound, userId);
                throw new KeyNotFoundException(AppConstants.Errors.UserNotFound);
            }

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Address = dto.Address;

            await _userRepository.SaveChangesAsync();
            _logger.LogInformation(AppConstants.Logs.UpdateUserProfileSuccess, userId);

            return MapToUserDto(user);
        }

       public async Task ProfileResetPasswordAsync(ResetPasswordProfile request)
        {
            var userId = GetAuthenticatedUserId();

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException(AppConstants.Errors.UserNotFound);
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                throw new InvalidOperationException("Passwords do not match.");
            }

            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            {
                _logger.LogWarning(AppConstants.Logs.PasswordResetSameAsOld, userId);
                throw new InvalidOperationException(AppConstants.Errors.PasswordSameAsOld);
            }

            if (!Regex.IsMatch(request.NewPassword, "[A-Z]"))
            {
                _logger.LogWarning(AppConstants.Logs.PasswordResetMissingCapital, userId);
                throw new InvalidOperationException(AppConstants.Errors.PasswordMustContainCapital);
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _userRepository.SaveChangesAsync();

            _logger.LogInformation("Profile password reset successful for User {UserId}.", userId);
        }


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
