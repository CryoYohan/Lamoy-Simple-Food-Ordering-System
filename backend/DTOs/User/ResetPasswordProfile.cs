namespace backend.DTOs.User
{
    public class ResetPasswordProfile
    {
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword {get; set;} = string.Empty; 
    }
}