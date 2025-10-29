using backend.DTOs.Order;

namespace backend.Services
{
    public interface IOrderService
    {
        Task<CheckoutResponse> CreateOrderAsync(CheckoutRequest request);
        Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<OrderDto> GetOrderByIdAsync(int orderId);
        Task CancelOrderAsync(int orderId);
    }
}