using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class MenuCategory
    {
        [Key]
        public int CategoryId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;

        //Menu Item reference
        public List<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    }
}