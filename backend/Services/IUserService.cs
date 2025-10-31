using backend.DTOs.User;
using System.Collections.Generic; // Add this
using System.Threading.Tasks; // Add this


namespace backend.Services
{
    public interface IUserService
    {
        Task RequestPasswordResetAsync(ForgotPasswordRequest request);
        Task ResetPasswordAsync(ResetPasswordRequest request);
        Task<UserDto> GetUserByIdAsync(int id); // This is for admins to get *any* user
        Task<IEnumerable<UserDto>> GetAllUsersAsync(); // This is for admins
        Task<UserDto> GetUserProfileAsync();
        Task<UserDto> UpdateUserProfileAsync(UserUpdateDto dto);
    }
}