using backend.Data;
using backend.Services; 
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using System.IO;
using System.Text;
using backend.Helpers;
using backend.Repositories;
using backend.Middleware;

// Load secrets from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);



// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// JWT Token Helper
builder.Services.AddScoped<JwtTokenHelper>();

// Application DB Context
builder.Services.AddDbContext<ApplicationDBContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:5174") // React dev server origins
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// ✅ Register EmailService
builder.Services.AddTransient<EmailService>();
builder.Services.AddAuthorization();

// Add AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// Add Repositories Service
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Add our user-related service
builder.Services.AddScoped<IUserService, UserService>();

// Add our menu-related services
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();

// Add our order-related services
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

//Add our admin services
builder.Services.AddScoped<IAdminService, AdminService>();

// Add HTTPContextAccessor for User Auth
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// 1. ErrorHandling MUST be the very first thing
// So it can catch errors from all other middleware
app.UseErrorHandlingMiddleware();

// 2. Redirect to HTTPS
app.UseHttpsRedirection();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. Serve static files (e.g., images)
app.UseStaticFiles(); // for wwwroot
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.WebRootPath, "uploads")),
    RequestPath = "/uploads"
});

// 4. CORS must come BEFORE Authentication/Authorization
// to handle preflight (OPTIONS) requests
app.UseCors("AllowReactApp");

// 5. Authentication (Who are you?)
app.UseAuthentication();

// 6. Authorization (Are you allowed?)
app.UseAuthorization();

// 7. Map to the final controller endpoint
app.MapControllers();

app.Run();