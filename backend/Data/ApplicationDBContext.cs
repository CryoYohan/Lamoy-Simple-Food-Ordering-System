using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> dbContextOptions)
        : base(dbContextOptions)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<MenuCategory> MenuCategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Order>()
                        .Property(m => m.TotalPrice)
                        .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                        .Property(m => m.PriceAtPurchase)
                        .HasPrecision(18, 2);

            modelBuilder.Entity<MenuItem>()
                        .Property(m => m.Price)
                        .HasPrecision(18, 2);
        }
        
    }
}