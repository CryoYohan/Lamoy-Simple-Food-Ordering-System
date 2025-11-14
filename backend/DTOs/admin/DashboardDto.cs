// DTOs/Admin/DashboardDto.cs
namespace backend.DTOs.Admin
{
    public class DashboardDto
    {
        public DashboardStatsDto Stats { get; set; } = new DashboardStatsDto();
        public List<SalesPointDto> SalesData { get; set; } = new List<SalesPointDto>();
        public List<RecentOrderDto> RecentOrders { get; set; } = new List<RecentOrderDto>();
        public List<ActivityDto> RecentActivity { get; set; } = new List<ActivityDto>();
        public List<OrderStatusDistributionDto> OrderStatusDistribution { get; set; } = new List<OrderStatusDistributionDto>();
    }
}

// DTOs/Admin/DashboardStatsDto.cs
namespace backend.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public int ActiveUsers { get; set; }
        public decimal MonthlyGrowth { get; set; }
    }
}

// DTOs/Admin/SalesPointDto.cs
namespace backend.DTOs.Admin
{
    public class SalesPointDto
    {
        public string Day { get; set; } = string.Empty; // "Mon", "Tue", etc.
        public decimal Sales { get; set; }
        public double Percentage { get; set; } // For chart height calculation
    }
}

// DTOs/Admin/RecentOrderDto.cs
namespace backend.DTOs.Admin
{
    public class RecentOrderDto
    {
        public int OrderId { get; set; }
        public string Customer { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
    }
}

// DTOs/Admin/ActivityDto.cs
namespace backend.DTOs.Admin
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty; // "5 mins ago", "1 hour ago"
        public string Type { get; set; } = string.Empty; // "order", "menu", "user"
    }
}

// DTOs/Admin/OrderStatusDistributionDto.cs
namespace backend.DTOs.Admin
{
    public class OrderStatusDistributionDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
        public string Color { get; set; } = string.Empty; // "green", "blue", "yellow", "red"
    }
}