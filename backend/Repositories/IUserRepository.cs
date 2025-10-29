using backend.Models;

namespace backend.Repositories
{
    public interface IUserRepository
    {
        Task<bool> UserExistsByUsernameAsync(string username);
        Task<bool> UserExistsByEmailAsync(string email);
        Task<User?> GetUserByEmailAsync(string email);
        Task CreateUserAsync(User user);
        Task<bool> UserExistsByIdAsync(int userId);
        
        Task<User?> GetUserByIdAsync(int id);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByPasswordResetTokenAsync(string token);
        Task SaveChangesAsync(); // To save updates
    }
}