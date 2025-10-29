using backend.DTOs.User;
using backend.Helpers;
using backend.Models;
using backend.Repositories;
using BCrypt.Net;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtTokenHelper _jwtHelper;
        private readonly ILogger<AuthService> _logger; // Logging Service

        public AuthService(IUserRepository userRepository, JwtTokenHelper jwtHelper, ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _jwtHelper = jwtHelper;
            _logger = logger;
        }

        public async Task RegisterAsync(RegisterRequest request)
        {
            _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

            // 1. Check if user already exists
            if (await _userRepository.UserExistsByUsernameAsync(request.UserName))
            {
                _logger.LogWarning("Registration failed: Username {Username} already exists.", request.UserName);
                throw new InvalidOperationException("Username already exists.");
            }
                
            if (await _userRepository.UserExistsByEmailAsync(request.Email))
            {
                _logger.LogWarning("Registration failed: Email {Email} already exists.", request.Email);
                throw new InvalidOperationException("Email already exists.");
            }
                
            // 2. Hash the password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Create the new User model
            var newUser = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = passwordHash,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                Role = UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            // 4. Save to the database via the repository
            await _userRepository.CreateUserAsync(newUser);
            
            _logger.LogInformation("User {Username} registered successfully with ID {UserId}", newUser.UserName, newUser.UserId);
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            // 1. Get user from repository
            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            // 2. Validate user and password
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", request.Email);
                throw new UnauthorizedAccessException("Invalid Email or password.");
            }

            // 3. Generate Token
            var token = _jwtHelper.GenerateToken(
                user.UserId.ToString(),
                user.Email,
                user.Role.ToString(),
                user.UserName
            );

            _logger.LogInformation("User {Username} (ID: {UserId}) logged in successfully.", user.UserName, user.UserId);

            // 4. Return the DTO
            return new LoginResponse
            {
                Token = token,
                Role = user.Role,
                UserName = user.UserName
            };
        }
    }
}