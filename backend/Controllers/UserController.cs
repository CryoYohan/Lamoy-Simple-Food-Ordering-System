using backend.DTOs.User;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // --- Password Reset Endpoints ---

        [HttpPost("request-password-reset")]
        public async Task<IActionResult> RequestReset([FromBody] ForgotPasswordRequest request)
        {
            // Middleware will catch any exceptions, but our service
            // is designed to return OK even if the user isn't found.
            await _userService.RequestPasswordResetAsync(request);
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // Middleware will catch the "Invalid or expired token" exception
            await _userService.ResetPasswordAsync(request);
            return Ok(new { message = "Password reset successful. You can now log in." });
        }
        
        // --- User Data Endpoints ---

        [HttpGet]
        [Authorize(Roles = "Admin")] // Protected! Only admins can see all users.
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize] // Protected! (You might enhance this to check if user ID matches token)
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            // Middleware will catch the "User not found" exception
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(user);
        }
    }
}