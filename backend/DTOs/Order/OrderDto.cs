using backend.Models;

namespace backend.DTOs.Order
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty; 
        public decimal TotalPrice { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime OrderDate { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
    }
}
