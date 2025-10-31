using System.ComponentModel.DataAnnotations;
using backend.Models; // We need this for the OrderStatus enum

namespace backend.DTOs.Order
{
    public class UpdateOrderStatusRequest
    {
        // This will be a number (1-5) sent from the frontend
        [Required]
        [EnumDataType(typeof(OrderStatus))]
        public OrderStatus Status { get; set; }
    }
}
