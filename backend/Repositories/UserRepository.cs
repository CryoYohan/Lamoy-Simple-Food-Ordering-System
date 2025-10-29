using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDBContext _context;

        // Inject the DbContext
        public UserRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<bool> UserExistsByIdAsync(int userId)
        {
            return await _context.Users.AnyAsync(u => u.UserId == userId);
        }

        public async Task<bool> UserExistsByUsernameAsync(string username)
        {
            // Use Async methods for database calls
            return await _context.Users.AnyAsync(u => u.UserName == username);
        }

        public async Task<bool> UserExistsByEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task CreateUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        public async Task<User?> GetUserByIdAsync(int id)
        {
            // FindAsync is efficient for getting by primary key
            return await _context.Users.FindAsync(id);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.AsNoTracking().ToListAsync();
        }

        public async Task<User?> GetUserByPasswordResetTokenAsync(string token)
        {
            // Find the user where the token matches AND the token hasn't expired
            return await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == token &&
                u.ResetTokenExpiry > DateTime.UtcNow);
        }

        public async Task SaveChangesAsync()
        {
            // This will save any tracked changes to the context
            await _context.SaveChangesAsync();
        }
    }
}