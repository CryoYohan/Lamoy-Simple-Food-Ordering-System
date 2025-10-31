using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDBContext _context;

        public OrderRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            // By adding the 'order' object, EF Core's change tracker
            // also automatically adds all the 'OrderItems' in its collection.
            _context.Orders.Add(order);
            
            // This single SaveChangesAsync() runs in a transaction,
            // ensuring both the Order and its OrderItems are saved or none are.
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems.OrderBy(oi => oi.OrderItemId))
                    .ThenInclude(oi => oi.MenuItem)
                .OrderByDescending(o => o.OrderDate)
                .AsNoTracking()
                .ToListAsync();
        }
        
        // --- ADD NEW METHOD FOR ADMIN ---
        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.User) // Include the User details
                .Include(o => o.OrderItems.OrderBy(oi => oi.OrderItemId))
                    .ThenInclude(oi => oi.MenuItem) // Include the items in the order
                .OrderByDescending(o => o.OrderDate) // Show newest orders first
                .AsNoTracking()
                .ToListAsync();
        }
        // ---------------------------------

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            // This gets a tracked entity, which is good for updates (like cancelling)
            // We need to include the User for the security check
            return await _context.Orders
                .Include(o => o.User) 
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<Order?> GetOrderByIdWithItemsAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.User) // Include User
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}