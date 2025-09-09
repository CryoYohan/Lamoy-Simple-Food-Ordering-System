using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        //User reference
        public int UserId { get; set; }
        [Required]
        public decimal TotalPrice { get; set; }
        [Required]
        public OrderStatus Status { get; set; }
        [Required]
        public DateTime OrderDate { get; set; }
        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;


        //User Navigation Property
        public User? User { get; set; }

        //Order_Item reference
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    }
}