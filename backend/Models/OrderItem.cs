using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        //Order reference
        public int OrderId { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public decimal PriceAtPurchase { get; set; }

        //Menu Item reference
        public int ItemId { get; set; }

        //Order Navigation Property
        public Order? Order { get; set; }

        //Menu_Item Navigation Property
        public MenuItem? MenuItem { get; set; }
    }
}