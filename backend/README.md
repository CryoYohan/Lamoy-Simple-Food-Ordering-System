# 🍽️ Lamoy Backend – ASP.NET Core Web API

This is the **backend API** for **Lamoy**, built with **ASP.NET Core** and **Entity Framework Core**.  
It provides RESTful endpoints for authentication, menu management, and order processing.

---

## 🚀 Tech Stack

- [.NET 9.0]
- [Entity Framework Core]
- [SQL Server]

---

## 📂 Project Structure

backend/
├── Controllers/ # API endpoints
├── Models/ # Entity models (User, Order, etc.)
├── Data/ # Database context (ApplicationDBContext)
├── Migrations/ # EF Core migrations
├── Program.cs # Entry point
├── appsettings.json # Default configuration (safe for Git)
├── appsettings.Development.json # Local configs (ignored in .gitignore)
└── README.md # Setup guide

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/YourRepo.git
cd YourRepo/backend
2. Install prerequisites
Install Visual Studio Code
Install Visual Studio (ASP.NET and Web Development & Azure Development)
Install SQL Server + SSMS

Check installation:
dotnet --version

3. Restore dependencies
dotnet restore

4. Configure database connection
Create a file appsettings.Development.json in the backend/ folder.

Add your local connection string:
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Lamoy;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
⚠️ Note: This file is ignored by Git so your credentials stay safe.

5. Apply EF Core migrations
Run migrations to set up the database schema:
dotnet ef database update

6. Run the backend
dotnet watch run

⚡ Common Commands
Run project:
dotnet run

Add new migration:
dotnet ef migrations add MigrationName

Update database:
dotnet ef database update

Remove last migration:
dotnet ef migrations remove

🔑 Environment Variables
Key	                Description
DefaultConnection	SQL Server connection string

👥 Contributors
Marlou Tadlip
Jomari Marson

```
