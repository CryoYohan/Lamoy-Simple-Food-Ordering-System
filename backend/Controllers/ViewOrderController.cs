using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;

// DTO for status update
public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
}

namespace backend.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class ViewOrderController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<ViewOrderController> _logger;

        public ViewOrderController(ApplicationDBContext context, ILogger<ViewOrderController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/orders/user/{userId} - Get orders by user ID
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrdersByUserId(int userId)
        {
            try 
            {
                _logger.LogInformation($"Getting orders for user {userId}");
                
                // First check if the user exists
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found");
                    return NotFound($"User with ID {userId} not found");
                }

                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .Include(o => o.OrderItems.OrderBy(oi => oi.OrderItemId))
                        .ThenInclude(oi => oi.MenuItem)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new
                    {
                        o.OrderId,
                        o.UserId,
                        o.TotalPrice,
                        o.Status,
                        o.OrderDate,
                        o.DeliveryAddress,
                        OrderItems = o.OrderItems.Select(oi => new
                        {
                            oi.OrderItemId,
                            oi.Quantity,
                            oi.PriceAtPurchase,
                            ItemName = oi.MenuItem != null ? oi.MenuItem.Name : "Unknown Item",
                            ItemId = oi.MenuItem != null ? oi.MenuItem.ItemId : 0,
                            Description = oi.MenuItem != null ? oi.MenuItem.Description : ""
                        }).ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {orders.Count} orders for user {userId}");
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting orders for user {userId}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/orders/{id} - Get order by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrderById(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.MenuItem)
                    .FirstOrDefaultAsync(o => o.OrderId == id);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                var orderResponse = new
                {
                    order.OrderId,
                    order.UserId,
                    order.TotalPrice,
                    order.Status,
                    order.OrderDate,
                    order.DeliveryAddress,
                    OrderItems = order.OrderItems.Select(oi => new
                    {
                        oi.OrderItemId,
                        oi.Quantity,
                        oi.PriceAtPurchase,
                        ItemName = oi.MenuItem != null ? oi.MenuItem.Name : "Unknown Item",
                        ItemId = oi.MenuItem != null ? oi.MenuItem.ItemId : 0,
                        Description = oi.MenuItem != null ? oi.MenuItem.Description : ""
                    }).ToList()
                };

                return Ok(orderResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting order {id}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/orders/{id}/cancel - Cancel an order
        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                _logger.LogInformation($"Cancelling order {id}");
                
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                {
                    _logger.LogWarning($"Order {id} not found");
                    return NotFound($"Order with ID {id} not found");
                }

                // Just cancel the order directly
                order.Status = OrderStatus.Cancelled;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Order {id} cancelled successfully");
                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling order {id}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}