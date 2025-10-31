using backend.DTOs.Order;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
// 1. Add required using statements
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/orders")] // All order-related endpoints now live here
    [ApiController]
    [Authorize] // 2. Protect all order routes by default
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger; // 3. Add logger field

        // 4. Inject ILogger
        public OrderController(IOrderService orderService, ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        // POST: api/orders
        // This endpoint replaces the old /api/checkout
        [HttpPost]
        public async Task<ActionResult<CheckoutResponse>> CreateOrder([FromBody] CheckoutRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // Service handles security and exceptions
            var response = await _orderService.CreateOrderAsync(request);
            return Ok(response);
        }

        // GET: api/orders/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByUserId(int userId)
        {
            // Service handles security (user vs admin)
            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            // Service handles security (user vs admin)
            var order = await _orderService.GetOrderByIdAsync(id);
            return Ok(order);
        }

        // POST: api/orders/{id}/cancel
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            // Service handles security (user vs admin)
            await _orderService.CancelOrderAsync(id);
            return Ok(new { message = "Order cancelled successfully" });
        }

        // --- 5. ADD NEW ADMIN-ONLY ENDPOINTS ---

        /// <summary>
        /// [ADMIN ONLY] Gets all orders from all users.
        /// </summary>
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")] // Double-check protection
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            _logger.LogInformation("Admin request to get all orders.");
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        /// <summary>
        /// [ADMIN ONLY] Updates the status of a specific order.
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")] // Double-check protection
        public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            _logger.LogInformation("Admin request to update status for order {OrderId} to {Status}", id, request.Status);
            var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, request);
            return Ok(updatedOrder);
        }
    }
}

