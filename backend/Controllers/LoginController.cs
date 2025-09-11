using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace backend.LoginControllers
{
    [Route("api/login")]
    [ApiController]
    public class LoginMineController : ControllerBase
    {
        private readonly Data.ApplicationDBContext _context;

        public LoginMineController(Data.ApplicationDBContext context)
        {
            _context = context;
        }

        public class LoginRequest
        {
            public string UserName { get; set; }
            public string Password { get; set; }
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Username and password are required.");

            var user = _context.Users.FirstOrDefault(u => u.UserName == request.UserName);
            if (user != null && user.PasswordHash == request.Password)
            {
                // Return only safe user info
                return Ok(new { user.UserId, user.UserName, user.Email, user.Role });
            }
            return Unauthorized("Invalid username or password.");
        }
    }
}