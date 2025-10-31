using backend.DTOs.User;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
// 1. Add required using statements
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize] // 2. Secure the entire controller by default
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger; // 3. Add logger

        // 4. Inject ILogger
        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        // --- NEW PROFILE ENDPOINTS (For the logged-in user) ---

        [HttpGet("profile")] // GET /api/user/profile
        public async Task<ActionResult<UserDto>> GetMyProfile()
        {
            _logger.LogInformation("Received request to get user profile.");
            // Service gets ID from the token claims
            var userProfile = await _userService.GetUserProfileAsync(); 
            return Ok(userProfile);
        }

        [HttpPut("profile")] // PUT /api/user/profile
        public async Task<ActionResult<UserDto>> UpdateMyProfile([FromBody] UserUpdateDto dto) // 5. Use UserUpdateDto
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _logger.LogInformation("Received request to update user profile.");
            // Service gets ID from the token claims and updates
            var updatedProfile = await _userService.UpdateUserProfileAsync(dto); 
            return Ok(updatedProfile);
        }
        
        // --- END NEW PROFILE ENDPOINTS ---


        // --- Password Reset Endpoints ---

        [HttpPost("request-password-reset")]
        [AllowAnonymous] // 6. Allow anonymous access
        public async Task<IActionResult> RequestReset([FromBody] ForgotPasswordRequest request)
        {
            await _userService.RequestPasswordResetAsync(request);
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous] // 6. Allow anonymous access
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            await _userService.ResetPasswordAsync(request);
            return Ok(new { message = "Password reset successful. You can now log in." });
        }
        
        // --- ADMIN-ONLY ENDPOINTS ---

        [HttpGet]
        [Authorize(Roles = "Admin")] // Kept admin-only
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            _logger.LogInformation("Admin request to get all users.");
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")] // 7. Changed to Admin-only for getting *other* users
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            _logger.LogInformation("Admin request to get user by ID: {UserId}", id);
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(user);
        }
        
    }
}
