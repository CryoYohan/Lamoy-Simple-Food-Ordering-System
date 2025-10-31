using backend.DTOs.Order;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Http; // Required for IHttpContextAccessor
using System.Security.Claims; // Required for ClaimsPrincipal
// Add missing using statements
using Microsoft.Extensions.Logging; 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            IOrderRepository orderRepository,
            IUserRepository userRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // ... CreateOrderAsync remains the same ...
        public async Task<CheckoutResponse> CreateOrderAsync(CheckoutRequest request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                throw new InvalidOperationException("Cart is empty.");
            }

            // --- SECURITY FIX START ---
            // Get the User ID from the authenticated user's claims
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) // Standard claim type for user ID
                           ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("userId"); // Fallback to custom claim if used

            // FIX: Declare variable outside the if
            int authenticatedUserId = 0; // Initialize with a default

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out authenticatedUserId)) // Assign within TryParse
            {
                _logger.LogError("Could not extract valid UserId claim from authenticated user during checkout.");
                throw new UnauthorizedAccessException("User is not properly authenticated or UserId claim is missing.");
            }

            // Optional: If the request *still* includes a UserId, you can log a warning or even throw an error if it doesn't match.
            if (request.UserId != 0 && request.UserId != authenticatedUserId)
            {
                 _logger.LogWarning("Checkout request UserId ({RequestUserId}) does not match authenticated user UserId ({AuthenticatedUserId}). Using authenticated user ID.", request.UserId, authenticatedUserId);
                 // Depending on requirements, you could throw new SecurityException("Attempted to place order for a different user.");
            }
            // --- SECURITY FIX END ---


            // Validate that the authenticated user exists (using the ID from claims)
            if (!await _userRepository.UserExistsByIdAsync(authenticatedUserId))
            {
                 // This case should ideally not happen if the token is valid, but good to check.
                _logger.LogError("Authenticated user with ID {UserId} not found in the database during checkout.", authenticatedUserId);
                throw new KeyNotFoundException($"Authenticated user with ID {authenticatedUserId} not found.");
            }

            // 1. Calculate total price
            decimal totalPrice = request.Items.Sum(i => i.Price * i.Quantity);

            // 2. Create the main Order object
            var order = new Order
            {
                UserId = authenticatedUserId, // <-- Use the ID obtained securely from claims
                DeliveryAddress = request.DeliveryAddress, // Delivery address can come from request or user profile
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
             var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("userId");

             // FIX: Declare variable outside the if
             int authenticatedUserId = 0; // Initialize with a default

             // Check if claim is valid AND if the authenticated ID matches the requested ID
             if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out authenticatedUserId) || authenticatedUserId != userId)
             {
                 var isAdmin = _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;
                 if (!isAdmin)
                 {
                     // Now authenticatedUserId is guaranteed to be in scope here
                     _logger.LogWarning("User {AuthenticatedUserId} attempted to access orders for different user {RequestedUserId}.", authenticatedUserId, userId);
                     throw new UnauthorizedAccessException("You are not authorized to view these orders.");
                 }
                 // Now authenticatedUserId is guaranteed to be in scope here
                 _logger.LogInformation("Admin user {AdminUserId} accessing orders for user {RequestedUserId}.", authenticatedUserId, userId);
             }

            _logger.LogInformation($"Getting orders for user {userId}");

            if (!await _userRepository.UserExistsByIdAsync(userId))
            {
                _logger.LogWarning($"User with ID {userId} not found");
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            _logger.LogInformation($"Found {orders.Count()} orders for user {userId}");

            return orders.Select(MapOrderToDto);
        }

        public async Task<OrderDto> GetOrderByIdAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdWithItemsAsync(orderId);

            if (order == null)
            {
                 _logger.LogWarning("Order with ID {OrderId} not found during GetOrderByIdAsync.", orderId);
                throw new KeyNotFoundException($"Order with ID {orderId} not found.");
            }

             var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("userId");

            // FIX: Declare variable outside the if
            int authenticatedUserId = 0; // Initialize with a default

             if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out authenticatedUserId) || authenticatedUserId != order.UserId)
             {
                 var isAdmin = _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;
                 if (!isAdmin) {
                     // Now authenticatedUserId is guaranteed to be in scope here
                     _logger.LogWarning("User {AuthenticatedUserId} attempted to access order {OrderId} belonging to user {OrderUserId}.", authenticatedUserId, orderId, order.UserId);
                     throw new UnauthorizedAccessException("You are not authorized to view this order.");
                 }
                 // Now authenticatedUserId is guaranteed to be in scope here
                 _logger.LogInformation("Admin user {AdminUserId} accessing order {OrderId} for user {OrderUserId}.", authenticatedUserId, orderId, order.UserId);
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

             var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("userId");

            // FIX: Declare variable outside the if
            int authenticatedUserId = 0; // Initialize with a default

             if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out authenticatedUserId) || authenticatedUserId != order.UserId)
             {
                 var isAdmin = _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;
                 if (!isAdmin) {
                     // Now authenticatedUserId is guaranteed to be in scope here
                     _logger.LogWarning("User {AuthenticatedUserId} attempted to cancel order {OrderId} belonging to user {OrderUserId}.", authenticatedUserId, orderId, order.UserId);
                     throw new UnauthorizedAccessException("You are not authorized to cancel this order.");
                 }
                 // Now authenticatedUserId is guaranteed to be in scope here
                 _logger.LogInformation("Admin user {AdminUserId} cancelling order {OrderId} for user {OrderUserId}.", authenticatedUserId, orderId, order.UserId);
             }

            if (order.Status != OrderStatus.Pending)
            {
                _logger.LogWarning($"Attempt to cancel order {orderId} failed (Status: {order.Status})");
                throw new InvalidOperationException($"Cannot cancel an order with status '{order.Status}'.");
            }

            order.Status = OrderStatus.Cancelled;
            await _orderRepository.SaveChangesAsync();
            _logger.LogInformation($"Order {orderId} cancelled successfully");
        }


        // --- ADMIN METHODS ---

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            // Security Check: Ensure user is Admin
            if (!(_httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false))
            {
                _logger.LogWarning("Non-admin user attempted to access GetAllOrdersAsync.");
                throw new UnauthorizedAccessException("You are not authorized to perform this action.");
            }

            _logger.LogInformation("Admin user fetching all orders.");
            var orders = await _orderRepository.GetAllOrdersAsync();
            return orders.Select(MapOrderToDto);
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request)
        {
            // Security Check: Ensure user is Admin
            if (!(_httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false))
            {
                _logger.LogWarning("Non-admin user attempted to update order status for {OrderId}.", orderId);
                throw new UnauthorizedAccessException("You are not authorized to perform this action.");
            }

            _logger.LogInformation("Admin user updating status for order {OrderId} to {Status}", orderId, request.Status);
            var order = await _orderRepository.GetOrderByIdAsync(orderId); // Gets tracked entity

            if (order == null)
            {
                _logger.LogWarning("Admin failed to update status: Order {OrderId} not found.", orderId);
                throw new KeyNotFoundException($"Order with ID {orderId} not found.");
            }

            // You could add business logic here, e.g.,
            // if (order.Status == OrderStatus.Delivered) throw new InvalidOperationException("Cannot change status of a delivered order.");
            
            order.Status = request.Status;

            await _orderRepository.SaveChangesAsync();
            _logger.LogInformation("Order {OrderId} status updated successfully to {Status}", orderId, request.Status);
            
            // Re-fetch with all items to return the full, updated DTO
            var updatedOrderWithItems = await _orderRepository.GetOrderByIdWithItemsAsync(orderId);
            
            return MapOrderToDto(updatedOrderWithItems!); // ! tells compiler we're sure it's not null
        }


        // --- Helper Mapping Method (UPDATED) ---
        private OrderDto MapOrderToDto(Order order)
        {
             return new OrderDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = order.User?.UserName ?? "N/A",
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                OrderDate = order.OrderDate,
                DeliveryAddress = order.DeliveryAddress,
                OrderItems = order.OrderItems.Select(oi => {
                    _logger.LogDebug("Mapping OrderItem {OrderItemId} for Order {OrderId}. MenuItem is null: {IsMenuItemNull}, ItemId: {ItemId}",
                        oi.OrderItemId, order.OrderId, oi.MenuItem == null, oi.ItemId);
                    
                    if (oi.MenuItem == null)
                    {
                        _logger.LogWarning("Order {OrderId}, OrderItem {OrderItemId} references invalid ItemId {ItemId}. MenuItem object was null during mapping.",
                            order.OrderId, oi.OrderItemId, oi.ItemId);
                    }

                    return new OrderItemDto
                    {
                        OrderItemId = oi.OrderItemId,
                        Quantity = oi.Quantity,
                        PriceAtPurchase = oi.PriceAtPurchase,
                        ItemName = oi.MenuItem?.Name ?? $"Unknown Item (ID: {oi.ItemId})", 
                        ItemId = oi.MenuItem?.ItemId ?? oi.ItemId,
                        Description = oi.MenuItem?.Description,
                        ImageUrl = oi.MenuItem?.ImageUrl 
                    };
                }).ToList()
            };
        }
    }
}

