using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public CheckoutController(ApplicationDBContext context)
        {
            _context = context;
        }

        // DTOs
        public class CheckoutItemDto
        {
            public int ItemId { get; set; }
            public int Quantity { get; set; }
            public decimal Price { get; set; }
        }

        public class CheckoutRequest
        {
            public int UserId { get; set; }
            public string DeliveryAddress { get; set; } = string.Empty;
            public List<CheckoutItemDto> Items { get; set; } = new List<CheckoutItemDto>();
        }

        [HttpPost]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                return BadRequest(new { message = "Cart is empty." });
            }

            // ✅ Calculate total price
            decimal totalPrice = request.Items.Sum(i => i.Price * i.Quantity);

            // ✅ Create new order
            var order = new Order
            {
                UserId = request.UserId,
                DeliveryAddress = request.DeliveryAddress,
                TotalPrice = totalPrice,
                Status = OrderStatus.Pending, // matches your enum
                OrderDate = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // ✅ Add order items
            foreach (var cartItem in request.Items)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.OrderId,
                    ItemId = cartItem.ItemId,
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = cartItem.Price
                };
                _context.OrderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order placed successfully!", orderId = order.OrderId });
        }
    }
}