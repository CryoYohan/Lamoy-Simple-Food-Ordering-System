using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace backend.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDBContext _db;

        public AdminService(ApplicationDBContext db)
        {
            _db = db;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var endOfLastMonth = startOfMonth.AddDays(-1);

            // ========== BASIC STATS ==========
            
            // Total sales (all time)
            var totalSales = await _db.Orders
                .Where(o => o.Status != OrderStatus.Cancelled)
                .SumAsync(o => (decimal?)o.TotalPrice) ?? 0m;

            // Total orders (all time, excluding cancelled)
            var totalOrders = await _db.Orders
                .Where(o => o.Status != OrderStatus.Cancelled)
                .CountAsync();

            // Active users (customers only)
            var activeUsers = await _db.Users
                .Where(u => u.Role == UserRole.Customer)
                .CountAsync();

            // Calculate monthly growth
            var currentMonthSales = await _db.Orders
                .Where(o => DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc) >= startOfMonth &&
                            o.Status != OrderStatus.Cancelled)
                .SumAsync(o => (decimal?)o.TotalPrice) ?? 0m;

            var lastMonthSales = await _db.Orders
                .Where(o => DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc) >= startOfLastMonth &&
                            DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc) <= endOfLastMonth &&
                            o.Status != OrderStatus.Cancelled)
                .SumAsync(o => (decimal?)o.TotalPrice) ?? 0m;

            decimal monthlyGrowth = 0m;
            if (lastMonthSales > 0)
                monthlyGrowth = ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
            else if (currentMonthSales > 0)
                monthlyGrowth = 100m;

            // ========== RECENT ORDERS ==========
            var recentOrders = await _db.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new RecentOrderDto
                {
                    OrderId = o.OrderId,
                    Customer = o.User != null ? o.User.FullName : "Guest",
                    Total = o.TotalPrice,
                    Status = o.Status.ToString(),
                    OrderDate = DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc) // ✅ fix
                })
                .ToListAsync();

            // ========== SALES DATA (Last 7 Days) ==========
            var fromDate = today.AddDays(-6); // Last 7 days including today
            var ordersLast7 = await _db.Orders
                .Where(o => DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc) >= fromDate &&
                            o.Status != OrderStatus.Cancelled)
                .Select(o => new { OrderDate = DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc), o.TotalPrice })
                .ToListAsync();

            var grouped = ordersLast7
                .GroupBy(x => x.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Total = g.Sum(x => x.TotalPrice)
                })
                .ToDictionary(x => x.Date, x => x.Total);

            var salesData = new List<SalesPointDto>();
            decimal maxDayTotal = grouped.Any() ? grouped.Values.Max() : 1m;

            for (int i = 0; i < 7; i++)
            {
                var day = fromDate.AddDays(i);
                var total = grouped.ContainsKey(day) ? grouped[day] : 0m;
                var percentage = maxDayTotal > 0 ? (double)((total / maxDayTotal) * 100.0m) : 0.0;
                if (total > 0 && percentage < 5) percentage = 5.0;

                salesData.Add(new SalesPointDto
                {
                    Day = day.ToString("ddd", CultureInfo.InvariantCulture),
                    Sales = total,
                    Percentage = Math.Round(percentage, 0)
                });
            }

            // ========== ORDER STATUS DISTRIBUTION ==========
            var totalOrdersForDistribution = await _db.Orders.CountAsync();
            var orderStatusCounts = await _db.Orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var statusDistribution = new List<OrderStatusDistributionDto>();
            foreach (OrderStatus status in Enum.GetValues(typeof(OrderStatus)))
            {
                var count = orderStatusCounts.FirstOrDefault(x => x.Status == status)?.Count ?? 0;
                var percentage = totalOrdersForDistribution > 0
                    ? Math.Round((decimal)count / totalOrdersForDistribution * 100, 1)
                    : 0m;

                string color = status switch
                {
                    OrderStatus.Delivered => "green",
                    OrderStatus.Preparing => "blue",
                    OrderStatus.Pending => "yellow",
                    OrderStatus.Cancelled => "red",
                    OrderStatus.Ready => "purple",
                    _ => "gray"
                };

                statusDistribution.Add(new OrderStatusDistributionDto
                {
                    Status = status.ToString(),
                    Count = count,
                    Percentage = percentage,
                    Color = color
                });
            }

            // ========== RECENT ACTIVITY ==========
            var recentOrderActivities = await _db.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(10)
                .Select(o => new
                {
                    o.OrderId,
                    OrderDate = DateTime.SpecifyKind(o.OrderDate, DateTimeKind.Utc), // ✅ fix
                    o.Status,
                    CustomerName = o.User != null ? o.User.FullName : "Guest"
                })
                .ToListAsync();

            var recentActivity = new List<ActivityDto>();
            int activityId = 1;
            foreach (var order in recentOrderActivities)
            {
                string action = "";
                string description = "";
                string type = "order";

                switch (order.Status)
                {
                    case OrderStatus.Pending:
                        action = "New order received";
                        description = $"Order #ORD-{order.OrderId} from {order.CustomerName}";
                        break;
                    case OrderStatus.Preparing:
                        action = "Order being prepared";
                        description = $"Order #ORD-{order.OrderId} is now being prepared";
                        break;
                    case OrderStatus.Ready:
                        action = "Order ready";
                        description = $"Order #ORD-{order.OrderId} is ready for delivery";
                        break;
                    case OrderStatus.Delivered:
                        action = "Order completed";
                        description = $"Order #ORD-{order.OrderId} marked as delivered";
                        break;
                    case OrderStatus.Cancelled:
                        action = "Order cancelled";
                        description = $"Order #ORD-{order.OrderId} was cancelled";
                        break;
                }

                recentActivity.Add(new ActivityDto
                {
                    Id = activityId++,
                    Action = action,
                    Description = description,
                    Time = GetTimeAgo(order.OrderDate),
                    Type = type
                });
            }
            recentActivity = recentActivity.Take(4).ToList();

            // ========== BUILD DASHBOARD DTO ==========
            return new DashboardDto
            {
                Stats = new DashboardStatsDto
                {
                    TotalSales = totalSales,
                    TotalOrders = totalOrders,
                    ActiveUsers = activeUsers,
                    MonthlyGrowth = Math.Round(monthlyGrowth, 1)
                },
                SalesData = salesData,
                RecentOrders = recentOrders,
                RecentActivity = recentActivity,
                OrderStatusDistribution = statusDistribution
            };
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var now = DateTime.UtcNow;
            var timeSpan = now - dateTime;

            if (timeSpan.TotalMinutes < 1) return "just now";
            if (timeSpan.TotalMinutes < 60) return $"{(int)timeSpan.TotalMinutes} mins ago";
            if (timeSpan.TotalHours < 24) return $"{(int)timeSpan.TotalHours} hour{((int)timeSpan.TotalHours != 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 7) return $"{(int)timeSpan.TotalDays} day{((int)timeSpan.TotalDays != 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 30) return $"{(int)(timeSpan.TotalDays / 7)} week{((int)(timeSpan.TotalDays / 7) != 1 ? "s" : "")} ago";

            return dateTime.ToString("MMM dd, yyyy");
        }
    }
}