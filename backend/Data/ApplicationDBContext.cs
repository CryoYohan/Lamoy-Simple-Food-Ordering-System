using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
        }

        // DbSets for your models
        public DbSet<User> Users { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<MenuCategory> MenuCategories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Call the base method first

            // --- Explicit Relationship Configuration ---

            // Order <-> User (One-to-Many)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)          // Each Order has one User
                .WithMany(u => u.Orders)      // Each User can have many Orders
                .HasForeignKey(o => o.UserId) // The foreign key in the Order table
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a User if they have Orders (adjust if needed)

            // Order <-> OrderItem (One-to-Many)
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)   // Each Order has many OrderItems
                .WithOne(oi => oi.Order)      // Each OrderItem belongs to one Order
                .HasForeignKey(oi => oi.OrderId) // The foreign key in the OrderItem table
                .OnDelete(DeleteBehavior.Cascade); // If an Order is deleted, delete its OrderItems

            // MenuItem <-> OrderItem (One-to-Many)
            modelBuilder.Entity<MenuItem>()
                .HasMany(mi => mi.OrderItems) // Each MenuItem can be in many OrderItems
                .WithOne(oi => oi.MenuItem)   // Each OrderItem references one MenuItem
                .HasForeignKey(oi => oi.ItemId) // The foreign key in the OrderItem table is ItemId
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a MenuItem if it's part of an OrderItem (Important!)

            // MenuCategory <-> MenuItem (One-to-Many)
             modelBuilder.Entity<MenuCategory>()
                 .HasMany(mc => mc.MenuItems)     // Each Category has many MenuItems
                 .WithOne(mi => mi.MenuCategory)  // Each MenuItem belongs to one Category
                 .HasForeignKey(mi => mi.CategoryId) // Foreign key in MenuItem
                 .OnDelete(DeleteBehavior.Restrict); // Prevent deleting Category if Items exist

            // --- Precision for Decimal Types ---
            modelBuilder.Entity<Order>()
                .Property(m => m.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(m => m.PriceAtPurchase)
                .HasPrecision(18, 2);

            modelBuilder.Entity<MenuItem>()
                .Property(m => m.Price)
                .HasPrecision(18, 2);

            // --- Unique Constraints (Ensure these match your schema) ---
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<MenuCategory>()
                .HasIndex(mc => mc.Name)
                .IsUnique();


            // --- Enum Conversions (Match your DB storage: string or int) ---
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>(); // Store Role enum as string ('customer', 'admin')

             modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<int>(); // Store OrderStatus enum as int (1, 2, 3, etc.)


            // --- Optional Table Naming Conventions (Uncomment/adjust if your DB uses snake_case) ---
            // modelBuilder.Entity<User>().ToTable("users");
            // modelBuilder.Entity<MenuItem>().ToTable("menu_items");
            // modelBuilder.Entity<MenuCategory>().ToTable("menu_categories");
            // modelBuilder.Entity<Order>().ToTable("orders");
            // modelBuilder.Entity<OrderItem>().ToTable("order_items");
        }
    }
}

