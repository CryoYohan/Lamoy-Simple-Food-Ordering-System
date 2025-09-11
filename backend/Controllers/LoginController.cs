using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/login")]
    public class LoginController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public LoginController(ApplicationDBContext context)
        {
            _context = context;
        }

        public class LoginRequest
        {
            public string UserNameOrEmail { get; set; }
            public string Password { get; set; }
        }

        [HttpPost]
        [Route("")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.UserNameOrEmail) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Username/email and password are required.");

            var user = _context.Users.FirstOrDefault(u =>
                u.UserName == request.UserNameOrEmail || u.Email == request.UserNameOrEmail);

            if (user == null)
                return Unauthorized("Invalid username/email or password.");

            // Simple password check (not secure for production)
            if (user.PasswordHash != request.Password)
                return Unauthorized("Invalid username/email or password.");

            // Optionally, return user info (never return password)
            return Ok(new { user.UserId, user.UserName, user.Email, user.Role });
        }
    }
}