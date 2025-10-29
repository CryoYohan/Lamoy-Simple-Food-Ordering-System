using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Menu
{
    public class MenuItemUpdateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        [Range(0.01, (double)decimal.MaxValue)]
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [Required]
        public bool IsAvailable { get; set; }
    }
}