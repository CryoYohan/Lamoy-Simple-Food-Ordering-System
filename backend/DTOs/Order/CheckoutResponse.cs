namespace backend.DTOs.Order
{
    public class CheckoutResponse
    {
        public string Message { get; set; } = string.Empty;
        public int OrderId { get; set; }
    }
}