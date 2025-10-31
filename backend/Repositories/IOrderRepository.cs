using backend.Models;

namespace backend.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(Order order);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId);
        Task<Order?> GetOrderByIdAsync(int orderId);
        Task<Order?> GetOrderByIdWithItemsAsync(int orderId);
        Task<IEnumerable<Order>> GetAllOrdersAsync(); // Get all orders
        Task SaveChangesAsync();
    }
}