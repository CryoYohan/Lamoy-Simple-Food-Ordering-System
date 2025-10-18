using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class MenuItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        //Category reference
        public int CategoryId { get; set; }
        [Required]
        public bool IsAvailable { get; set; }

        //OrderItem reference
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        //Category Navigation Property
        public MenuCategory? MenuCategory { get; set; }
    }
}