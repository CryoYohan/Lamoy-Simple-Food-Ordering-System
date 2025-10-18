using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.DTOs.User;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/login")]
    public class AuthController : ControllerBase
    {
        private readonly JwtTokenHelper _jwtHelper;
        private readonly ApplicationDBContext _context;

        public AuthController(JwtTokenHelper jwtHelper, ApplicationDBContext context)
        {
            _jwtHelper = jwtHelper;
            _context = context;
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Email and password are required.");

            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user != null && BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                var token = _jwtHelper.GenerateToken(
                    user.UserId.ToString(),
                    request.Email,
                    user.Role.ToString(),
                    user.UserName
                );

                return Ok(new
                {
                    Token = token,
                    Role = user.Role, // 1 = Admin, 2 = User
                    UserName = user.UserName
                });
            }

            return Unauthorized("Invalid Email or password.");
        }
    }
}
