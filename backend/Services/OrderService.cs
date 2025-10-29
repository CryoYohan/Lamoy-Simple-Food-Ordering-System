using backend.DTOs.Order;
using backend.Models;
using backend.Repositories;

namespace backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository; // We also inject this
        private readonly ILogger<OrderService> _logger;

        public OrderService(IOrderRepository orderRepository, IUserRepository userRepository, ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<CheckoutResponse> CreateOrderAsync(CheckoutRequest request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                throw new InvalidOperationException("Cart is empty.");
            }

            // **Security Note:** In a real app, you would get the UserId from the
            // user's JWT token, not the request body, to prevent one user
            // from placing an order for another user.

            // Validate that the user exists
            if (!await _userRepository.UserExistsByIdAsync(request.UserId))
            {
                throw new KeyNotFoundException($"User with ID {request.UserId} not found.");
            }

            // 1. Calculate total price
            decimal totalPrice = request.Items.Sum(i => i.Price * i.Quantity);

            // 2. Create the main Order object
            var order = new Order
            {
                UserId = request.UserId,
                DeliveryAddress = request.DeliveryAddress,
                TotalPrice = totalPrice,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.UtcNow,
                // 3. Create and add OrderItem objects to the Order
                OrderItems = request.Items.Select(cartItem => new OrderItem
                {
                    ItemId = cartItem.ItemId,
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = cartItem.Price
                }).ToList()
            };

            // 4. Pass the complete Order object (with its items) to the repository
            // The repo will save it all in one transaction.
            var createdOrder = await _orderRepository.CreateOrderAsync(order);
            _logger.LogInformation($"Order {createdOrder.OrderId} placed successfully for user {createdOrder.UserId}");

            return new CheckoutResponse 
            { 
                Message = "Order placed successfully!", 
                OrderId = createdOrder.OrderId 
            };
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {
            _logger.LogInformation($"Getting orders for user {userId}");
            
            // 1. Check if user exists
            if (!await _userRepository.UserExistsByIdAsync(userId))
            {
                _logger.LogWarning($"User with ID {userId} not found");
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            // 2. Get data from repo
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            _logger.LogInformation($"Found {orders.Count()} orders for user {userId}");

            // 3. Map models to DTOs
            return orders.Select(MapOrderToDto);
        }

        public async Task<OrderDto> GetOrderByIdAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdWithItemsAsync(orderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Order with ID {orderId} not found.");
            }

            return MapOrderToDto(order);
        }

        public async Task CancelOrderAsync(int orderId)
        {
            _logger.LogInformation($"Attempting to cancel order {orderId}");
            var order = await _orderRepository.GetOrderByIdAsync(orderId); // Gets tracked entity

            if (order == null)
            {
                _logger.LogWarning($"Order {orderId} not found");
                throw new KeyNotFoundException($"Order with ID {orderId} not found.");
            }

            // Business logic: You can only cancel pending orders
            if (order.Status != OrderStatus.Pending)
            {
                _logger.LogWarning($"Attempt to cancel order {orderId} failed (Status: {order.Status})");
                throw new InvalidOperationException($"Cannot cancel an order with status '{order.Status}'.");
            }

            order.Status = OrderStatus.Cancelled;
            await _orderRepository.SaveChangesAsync(); // Save the changes
            _logger.LogInformation($"Order {orderId} cancelled successfully");
        }


        // --- Helper Mapping Method ---
        private OrderDto MapOrderToDto(Order order)
        {
            return new OrderDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                OrderDate = order.OrderDate,
                DeliveryAddress = order.DeliveryAddress,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    Quantity = oi.Quantity,
                    PriceAtPurchase = oi.PriceAtPurchase,
                    ItemName = oi.MenuItem?.Name ?? "Unknown Item",
                    ItemId = oi.MenuItem?.ItemId ?? 0,
                    Description = oi.MenuItem?.Description
                }).ToList()
            };
        }
    }
}