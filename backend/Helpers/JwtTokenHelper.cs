using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

public class JwtTokenHelper
{
    private readonly IConfiguration _config;

    public JwtTokenHelper(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(string userId, string email, string role, string name)
    {
        var claims = new[]
        {
            new Claim("userId", userId),
            new Claim("email", email),
            new Claim("role", role),
            new Claim("name", name)
        };

#pragma warning disable CS8604 // Possible null reference argument.
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
#pragma warning restore CS8604 // Possible null reference argument.
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(_config["Jwt:ExpireMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}