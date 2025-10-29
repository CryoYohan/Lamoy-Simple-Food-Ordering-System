using backend.DTOs.User;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // No try-catch needed!
            // If RegisterAsync throws "InvalidOperationException",
            // the middleware will catch it and return a 409 Conflict.
            
            await _authService.RegisterAsync(request);
            return Ok(new { message = "Registration complete!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // No try-catch needed!
            // If LoginAsync throws "UnauthorizedAccessException",
            // the middleware will catch it and return a 401 Unauthorized.
            
            var response = await _authService.LoginAsync(request);
            return Ok(response); // Returns the 200 OK with LoginResponse DTO
        }
    }
}