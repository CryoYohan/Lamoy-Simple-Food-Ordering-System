namespace backend.DTOs.Order
{
    public class OrderItemDto
    {
        public int OrderItemId { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int ItemId { get; set; }
        public string? Description { get; set; }
    }
}