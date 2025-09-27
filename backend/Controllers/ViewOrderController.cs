using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class ViewOrderController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public ViewOrderController(ApplicationDBContext context)
        {
            _context = context;
        }

        // Helper method to check if user is admin
        private async Task<bool> IsUserAdmin(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user?.Role == UserRole.Admin;
        }

        // DTOs for request/response
        public class CreateOrderRequest
        {
            public int UserId { get; set; }
            public string DeliveryAddress { get; set; } = string.Empty;
            public List<OrderItemRequest> OrderItems { get; set; } = new List<OrderItemRequest>();
        }

        public class OrderItemRequest
        {
            public int ItemId { get; set; }
            public int Quantity { get; set; }
        }

        public class UpdateOrderStatusRequest
        {
            public OrderStatus Status { get; set; }
        }

        // GET: api/orders - Get all orders (Admin only)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllOrders([FromQuery] int adminUserId)
        {
            // Check if user is admin
            if (!await IsUserAdmin(adminUserId))
            {
                return Forbid("Access denied. Admin role required.");
            }

            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.OrderId,
                    o.UserId,
                    UserName = o.User!.UserName,
                    UserEmail = o.User!.Email,
                    o.TotalPrice,
                    o.Status,
                    o.OrderDate,
                    o.DeliveryAddress,
                    OrderItems = o.OrderItems.Select(oi => new
                    {
                        oi.OrderItemId,
                        oi.Quantity,
                        oi.PriceAtPurchase,
                        ItemName = oi.MenuItem!.Name,
                        ItemId = oi.MenuItem!.ItemId
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/orders/{id} - Get order by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
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
                UserName = order.User!.UserName,
                UserEmail = order.User!.Email,
                order.TotalPrice,
                order.Status,
                order.OrderDate,
                order.DeliveryAddress,
                OrderItems = order.OrderItems.Select(oi => new
                {
                    oi.OrderItemId,
                    oi.Quantity,
                    oi.PriceAtPurchase,
                    ItemName = oi.MenuItem!.Name,
                    ItemId = oi.MenuItem!.ItemId
                }).ToList()
            };

            return Ok(orderResponse);
        }

        // GET: api/orders/user/{userId} - Get orders by user ID
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrdersByUserId(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.OrderId,
                    o.UserId,
                    UserName = o.User!.UserName,
                    UserEmail = o.User!.Email,
                    o.TotalPrice,
                    o.Status,
                    o.OrderDate,
                    o.DeliveryAddress,
                    OrderItems = o.OrderItems.Select(oi => new
                    {
                        oi.OrderItemId,
                        oi.Quantity,
                        oi.PriceAtPurchase,
                        ItemName = oi.MenuItem!.Name,
                        ItemId = oi.MenuItem!.ItemId
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/orders/status/{status} - Get orders by status
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrdersByStatus(OrderStatus status)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.OrderId,
                    o.UserId,
                    UserName = o.User!.UserName,
                    UserEmail = o.User!.Email,
                    o.TotalPrice,
                    o.Status,
                    o.OrderDate,
                    o.DeliveryAddress,
                    OrderItems = o.OrderItems.Select(oi => new
                    {
                        oi.OrderItemId,
                        oi.Quantity,
                        oi.PriceAtPurchase,
                        ItemName = oi.MenuItem!.Name,
                        ItemId = oi.MenuItem!.ItemId
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // POST: api/orders - Create new order
        [HttpPost]
        public async Task<ActionResult<object>> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (request.OrderItems == null || !request.OrderItems.Any())
            {
                return BadRequest("Order must contain at least one item.");
            }

            if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
            {
                return BadRequest("Delivery address is required.");
            }

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var itemIds = request.OrderItems.Select(oi => oi.ItemId).ToList();
            var menuItems = await _context.MenuItems
                .Where(mi => itemIds.Contains(mi.ItemId) && mi.IsAvailable)
                .ToListAsync();

            if (menuItems.Count != itemIds.Count)
            {
                return BadRequest("One or more menu items are not available or do not exist.");
            }

            decimal totalPrice = 0;
            var orderItems = new List<OrderItem>();

            foreach (var orderItemRequest in request.OrderItems)
            {
                var menuItem = menuItems.First(mi => mi.ItemId == orderItemRequest.ItemId);
                totalPrice += menuItem.Price * orderItemRequest.Quantity;

                orderItems.Add(new OrderItem
                {
                    ItemId = orderItemRequest.ItemId,
                    Quantity = orderItemRequest.Quantity,
                    PriceAtPurchase = menuItem.Price
                });
            }

            var order = new Order
            {
                UserId = request.UserId,
                TotalPrice = totalPrice,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.UtcNow,
                DeliveryAddress = request.DeliveryAddress,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var createdOrder = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.MenuItem)
                .FirstAsync(o => o.OrderId == order.OrderId);

            var orderResponse = new
            {
                createdOrder.OrderId,
                createdOrder.UserId,
                UserName = createdOrder.User!.UserName,
                UserEmail = createdOrder.User!.Email,
                createdOrder.TotalPrice,
                createdOrder.Status,
                createdOrder.OrderDate,
                createdOrder.DeliveryAddress,
                OrderItems = createdOrder.OrderItems.Select(oi => new
                {
                    oi.OrderItemId,
                    oi.Quantity,
                    oi.PriceAtPurchase,
                    ItemName = oi.MenuItem!.Name,
                    ItemId = oi.MenuItem!.ItemId
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, orderResponse);
        }

        // PUT: api/orders/{id}/status - Update order status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully.", orderId = id, newStatus = request.Status });
        }

        // PUT: api/orders/{id} - Update entire order (Admin only)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] CreateOrderRequest request, [FromQuery] int adminUserId)
        {
            if (!await IsUserAdmin(adminUserId))
            {
                return Forbid("Access denied. Admin role required.");
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (request.OrderItems == null || !request.OrderItems.Any())
            {
                return BadRequest("Order must contain at least one item.");
            }

            if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
            {
                return BadRequest("Delivery address is required.");
            }

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var itemIds = request.OrderItems.Select(oi => oi.ItemId).ToList();
            var menuItems = await _context.MenuItems
                .Where(mi => itemIds.Contains(mi.ItemId) && mi.IsAvailable)
                .ToListAsync();

            if (menuItems.Count != itemIds.Count)
            {
                return BadRequest("One or more menu items are not available or do not exist.");
            }

            _context.OrderItems.RemoveRange(order.OrderItems);

            decimal totalPrice = 0;
            var newOrderItems = new List<OrderItem>();

            foreach (var orderItemRequest in request.OrderItems)
            {
                var menuItem = menuItems.First(mi => mi.ItemId == orderItemRequest.ItemId);
                totalPrice += menuItem.Price * orderItemRequest.Quantity;

                newOrderItems.Add(new OrderItem
                {
                    OrderId = order.OrderId,
                    ItemId = orderItemRequest.ItemId,
                    Quantity = orderItemRequest.Quantity,
                    PriceAtPurchase = menuItem.Price
                });
            }

            order.UserId = request.UserId;
            order.TotalPrice = totalPrice;
            order.DeliveryAddress = request.DeliveryAddress;
            order.OrderItems = newOrderItems;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order updated successfully.", orderId = id });
        }

        // DELETE: api/orders/{id} - Delete order (Admin only)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id, [FromQuery] int adminUserId)
        {
            if (!await IsUserAdmin(adminUserId))
            {
                return Forbid("Access denied. Admin role required.");
            }

            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (order.Status != OrderStatus.Pending)
            {
                return BadRequest("Only pending orders can be deleted.");
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order deleted successfully.", orderId = id });
        }
    }
}
