using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.User
{
    public class UserUpdateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters.")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(255, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 255 characters.")]
        public string Address { get; set; } = string.Empty;
    }
}
