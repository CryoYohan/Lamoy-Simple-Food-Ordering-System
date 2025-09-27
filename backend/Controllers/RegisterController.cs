using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

namespace backend.Controllers
{
    [Route("api/register")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly Data.ApplicationDBContext _context;

        public RegisterController(Data.ApplicationDBContext context)
        {
            _context = context;
        }

        public class RegisterRequest
        {
            public required string UserName { get; set; }
            public required string Email { get; set; }
            public required string Password { get; set; }
            public required string FullName { get; set; }
            public required string PhoneNumber { get; set; }
            public required string Address { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            
            if (_context.Users.Any(u => u.UserName == request.UserName))
                return Conflict("Username already exists.");
            if (_context.Users.Any(u => u.Email == request.Email))
                return Conflict("Email already exists.");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new Models.User
            {
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = passwordHash, 
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                Role = Models.UserRole.Customer, 
                CreatedAt = DateTime.UtcNow // <-- Use UTC time
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration complete!" });
        }
    }
}