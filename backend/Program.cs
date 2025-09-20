using backend.Data;
using backend.Services; // 👈 add this
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

// Load secrets from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

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
            .WithOrigins("http://localhost:5173") // React dev server origin
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});


// ✅ Register EmailService
builder.Services.AddTransient<EmailService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Use CORS before other middleware that handles requests
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
