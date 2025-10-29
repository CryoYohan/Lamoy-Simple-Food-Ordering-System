using System.Net;
using System.Text.Json;

namespace backend.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Try to run the next piece of middleware (or the controller)
                await _next(context);
            }
            catch (Exception ex)
            {
                // If an exception happens, handle it
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Log the error
            _logger.LogError(exception, "An unhandled exception occurred.");

            // Default to a 500 Internal Server Error
            HttpStatusCode statusCode = HttpStatusCode.InternalServerError;
            string errorMessage = "An internal server error occurred.";

            // Check for our specific custom exceptions from the service layer
            switch (exception)
            {
                case InvalidOperationException ex: // e.g., "Username already exists"
                    statusCode = HttpStatusCode.Conflict; // 409
                    errorMessage = ex.Message;
                    break;
                case UnauthorizedAccessException ex: // e.g., "Invalid password"
                    statusCode = HttpStatusCode.Unauthorized; // 401
                    errorMessage = ex.Message;
                    break;
                case KeyNotFoundException ex: // Example: If an ID isn't found
                    statusCode = HttpStatusCode.NotFound; // 404
                    errorMessage = ex.Message;
                    break;
                // You can add more custom exception types here
            }

            // Set the HTTP response
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            // Create the JSON error object
            var errorResponse = new { error = errorMessage };
            var jsonResponse = JsonSerializer.Serialize(errorResponse);

            // Write the JSON to the response
            await context.Response.WriteAsync(jsonResponse);
        }
    }
}