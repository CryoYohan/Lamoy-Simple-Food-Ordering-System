namespace backend.DTOs.Order
{
    public class CheckoutRequest
    {
        public int UserId { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<CheckoutItemDto> Items { get; set; } = new List<CheckoutItemDto>();
    }
}