namespace backend.Constants
{
    public static class AppConstants
    {
        public static class Messages
        {
                public const string InternalServerError = "An internal server error occurred.";

            // Menu messages
            public const string MenuNotFound = "Menu item not found.";
            public const string CategoryNotFound = "Category '{0}' not found.";
            public const string ImageSaveError = "Failed to save image.";
            public const string QueryRequired = "Query parameter is required.";

            // User messages
            public const string PasswordResetSubject = "Password Reset Request";
            public const string PasswordResetEmailBody = "Click the link below to reset your password:";
            public const string PasswordResetExpiryNotice = "This link expires in 1 hour.";

            public const string OrderPlaced = "Order placed successfully!";
            public const string OrderCancelled = "Order cancelled successfully!";
            public const string OrderStatusUpdated = "Order {0} status updated to {1}.";

            public const string AuthControllerMessage = "Registration complete!" ;
        }

        public static class Logs
        {
                public const string UnhandledException = "An unhandled exception occurred.";

            // Menu logs
            public const string FetchById = "Fetching menu item by ID: {ItemId}";
            public const string FetchSuccess = "Successfully fetched menu item {ItemId}.";
            public const string FetchFail = "Menu item with ID {ItemId} not found.";

            public const string CreateAttempt = "Attempting to create menu item: {Name}";
            public const string CategoryMissing = "Failed to create menu item: Category {Category} not found.";

            public const string UploadingImage = "Uploading image for new menu item {Name}";
            public const string ImageSaved = "Image saved at {ImageUrl}";
            public const string ImageError = "Error saving image for menu item {Name}";

            public const string UpdateAttempt = "Attempting to update menu item with ID: {ItemId}";
            public const string UpdateSuccess = "Menu item {ItemId} updated successfully.";
            public const string UpdateFail = "Failed to update: Menu item with ID {ItemId} not found.";

            public const string DeleteAttempt = "Attempting to delete menu item with ID: {ItemId}";
            public const string DeleteSuccess = "Menu item {ItemId} deleted successfully.";
            public const string DeleteFail = "Failed to delete: Menu item with ID {ItemId} not found.";

            public const string FetchAll = "Fetching all available menu items";
            public const string FetchAllAdmin = "Fetching ALL menu items for admin";
            public const string SearchAttempt = "Searching for menu items with query: {Query}";
            public const string SearchEmpty = "Search failed: Query parameter was empty or whitespace.";
            public const string FetchCategories = "Fetching all menu categories";

            // User logs
            public const string InvalidUserIdClaim = "Could not parse user ID from claims.";
            public const string PasswordResetRequested = "Password reset requested for email: {0}";
            public const string PasswordResetUserNotFound = "Password reset for {0} failed: User not found.";
            public const string PasswordResetTokenGenerated = "Generated password reset token for User {0}";
            public const string PasswordResetEmailSent = "Password reset email sent to {0}";
            public const string PasswordResetAttempt = "Attempting to reset password with token: {0}";
            public const string PasswordResetInvalidToken = "Password reset failed: Invalid or expired token {0}";
            public const string PasswordResetSameAsOld = "Password reset failed: New password is the same as current password for User {0}";
            public const string PasswordResetMissingCapital = "Password reset failed: Password must contain at least 1 capital letter for User {0}";
            public const string PasswordResetSuccess = "Password reset successful for User {0}";

            public const string FetchUserById = "Fetching user by ID: {0}";
            public const string FetchUserNotFound = "Failed to fetch user: User with ID {0} not found.";
            public const string FetchAllUsers = "Fetching all users";

            public const string FetchUserProfile = "Fetching profile for authenticated User {0}";
            public const string UserProfileNotFound = "Authenticated User {0} not found in database.";
            public const string UpdateUserProfileAttempt = "Attempting to update profile for User {0}";
            public const string UpdateUserProfileUserNotFound = "Profile update failed: User with ID {0} not found.";
            public const string UpdateUserProfileSuccess = "Profile updated successfully for User {0}";

            // Order logs   
            public const string CheckoutSuccess = "Order {0} placed successfully for user {1}.";
            public const string FetchOrdersByUser = "Fetching orders for user {0}.";
            public const string FetchOrdersCount = "Found {0} orders for user {1}.";
            public const string OrderCancelAttempt = "Attempting to cancel order {0}.";
            public const string AdminFetchAllOrders = "Admin fetching all orders.";
            public const string AdminUpdateOrderStatus = "Admin updating order {0} status to {1}.";

            
public static class MenuRequest
{
    public const string AdminGetAll = "Received admin request to get ALL menu items.";
    public const string Create = "Received request to create menu item: {Name}";
    public const string CreateInvalidModel = "CreateMenuItem failed: Invalid model state.";

    public const string Update = "Received request to update menu item with ID: {ItemId}";
    public const string UpdateInvalidModel = "UpdateMenuItem failed for ID {ItemId}: Invalid model state.";

    public const string Delete = "Received request to delete menu item with ID: {ItemId}";

    public const string GetAll = "Received request to get all available menu items.";
    public const string GetCategories = "Received request to get all menu categories.";
    public const string GetByCategory = "Received request to get menu items by category ID: {CategoryId}";
    public const string Search = "Received request to search menu items with query: {Query}";
    public const string GetById = "Received request to get menu item by ID: {ItemId}";
}

public static class OrderController
            {
                public const string message = "Order cancelled successfully";
                public const string log = "Admin request to update status for order {OrderId} to {Status}";

               
            }
    public static class UserController
            {
                public const string RequestReceived = "Received request to get user profile.";
                 public const string IfExist = "If an account with that email exists, a password reset link has been sent.";

                public const string Successful = "Password reset successful. You can now log in.";
                public const string SuccessfulChangePass = "Password change successful.";
            }
            
        }

        public static class Errors
        {
            public const string Unauthorized = "User is not properly authenticated or UserId claim is missing.";
            public const string InvalidToken = "Invalid or expired token.";
            public const string PasswordSameAsOld = "You cannot use the same password as your current password.";
            public const string PasswordMustContainCapital = "Password must contain at least 1 capital letter.";

                        public const string UserNotFound = "User not found.";

                        public const string EmptyCart = "Cart is empty.";
            public const string OrderNotFound = "Order with ID {0} not found.";
            public const string CannotCancelOrder = "Cannot cancel an order with status '{0}'.";
            public const string QueryRequired = "Query parameter is required.";

            

        }

        public static class Storage
        {
            public const string UploadsFolder = "uploads";
        }

        public static class Urls
        {
            public const string ResetPasswordPage = "http://localhost:5173/reset-password";
        }

        public static class Claims
        {
            public const string UserId = "userId";
               public const string Email = "email";
    public const string Role = "role";
    public const string Name = "name";
        }
               public static class Roles
        {
            public const string Admin = "Admin";
            public const string User = "User";
        }
         public static class Placeholders
        {
            public const string NotAvailable = "N/A";
            public const string UnknownItem = "Unknown Item (ID: {0})";
        }

        public static class Jwt
{
    public const string Key = "Jwt:Key";
    public const string Issuer = "Jwt:Issuer";
    public const string Audience = "Jwt:Audience";
    public const string ExpireMinutes = "Jwt:ExpireMinutes";
}
  public static class MimeTypes
    {
        public const string Json = "application/json";
    }

    public static class AdminServiceMessages
    {
        public const string Guest = "Guest";
        public const string OrderPrefix = "Order #ORD-";
    }

    public static class AdminServiceTimePhrases
    {
        public const string JustNow = "just now";
        public const string MinutesAgo = "{0} mins ago";
        public const string HourAgo = "{0} hour{1} ago";
        public const string DayAgo = "{0} day{1} ago";
        public const string WeekAgo = "{0} week{1} ago";
        public const string DateFormat = "MMM dd, yyyy";
    }

    public static class AdminServiceActivityTypes
    {
        public const string ActivityType = "order";
        public const string NewOrderReceived = "New order received";
        public const string OrderBeingPrepared = "Order being prepared";
        public const string OrderReady = "Order ready";
        public const string OrderCompleted = "Order completed";
        public const string OrderCancelled = "Order cancelled";
        public const string OrderNowBeingPrepared = "{0} is now being prepared";
        public const string OrderReadyForDelivery = "{0} is ready for delivery";
        public const string OrderMarkedAsDelivered = "{0} marked as delivered";
        public const string OrderWasCancelled = "{0} was cancelled";
        public const string OrderFrom = "{0} from {1}";
    }

    public static class AdminServiceColors
    {
        public const string Green = "green";
        public const string Blue = "blue";
        public const string Yellow = "yellow";
        public const string Red = "red";
        public const string Purple = "purple";
        public const string Gray = "gray";
    }

    public static class AuthServiceErrors
    {
        public const string UsernameAlreadyExists = "Username already exists.";
        public const string EmailAlreadyExists = "Email already exists.";
        public const string InvalidEmailOrPassword = "Invalid Email or password.";
    }

    public static class AuthServiceLogs
    {
        public const string RegistrationAttempt = "Registration attempt for email: {0}";
        public const string RegistrationFailed = "Registration failed: {0} {1} already exists.";
        public const string UserRegisteredSuccessfully = "User {0} registered successfully with ID {1}";
        public const string LoginAttempt = "Login attempt for email: {0}";
        public const string FailedLoginAttempt = "Failed login attempt for email: {0}";
        public const string UserLoggedInSuccessfully = "User {0} (ID: {1}) logged in successfully.";
    }

    public static class EmailServiceEnvironmentVariables
    {
        public const string SmtpServer = "SMTP_SERVER";
        public const string SmtpPort = "SMTP_PORT";
        public const string SmtpSenderName = "SMTP_SENDER_NAME";
        public const string SmtpEmail = "SMTP_EMAIL";
        public const string SmtpPassword = "SMTP_PASSWORD";
    }

    public static class EmailServiceSettings
    {
        public const bool EnableSsl = true;
        public const bool IsBodyHtml = true;
    }

    public static class FileStorageServiceErrors
    {
        public const string FileCannotBeNullOrEmpty = "File cannot be null or empty.";
    }

    public static class FileStorageServicePaths
    {
        public const string PathSeparator = "/";
    }

    
}
    }
  
