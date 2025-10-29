using backend.DTOs.Order;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/orders")] // All order-related endpoints now live here
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // POST: api/orders
        // This endpoint replaces the old /api/checkout
        [HttpPost]
        [Authorize] // Good to protect checkout
        public async Task<ActionResult<CheckoutResponse>> CreateOrder([FromBody] CheckoutRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // Middleware will catch KeyNotFoundException (user not found)
            // or InvalidOperationException (cart empty)
            var response = await _orderService.CreateOrderAsync(request);
            return Ok(response);
        }

        // GET: api/orders/user/{userId}
        [HttpGet("user/{userId}")]
        [Authorize] // Good to protect
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByUserId(int userId)
        {
            // **Security Note:** Ideally, you'd check if the logged-in user's ID
            // matches the {userId} parameter, to stop users from seeing
            // each other's orders. This logic would go in the service.
            
            // Middleware will catch KeyNotFoundException (user not found)
            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        [Authorize] // Good to protect
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            // Middleware will catch KeyNotFoundException (order not found)
            var order = await _orderService.GetOrderByIdAsync(id);
            return Ok(order);
        }

        // POST: api/orders/{id}/cancel
        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(int id)
        {
            // Middleware will catch KeyNotFoundException (order not found)
            // or InvalidOperationException (order not pending)
            await _orderService.CancelOrderAsync(id);
            return Ok(new { message = "Order cancelled successfully" });
        }
    }
}