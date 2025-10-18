using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using System.Threading.Tasks;
using System;
using backend.DTO.admin;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin/menu")]
    // [Authorize(Roles = "Admin")]  // Uncomment once you have authentication
    public class AdminMenuController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public AdminMenuController(ApplicationDBContext context)
        {
            _context = context;
        }

        // POST: api/admin/menu
        [HttpPost]
        public async Task<ActionResult> CreateMenuItem([FromForm] MenuItemCreateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Validate Category
                var category = await _context.MenuCategories
                    .FirstOrDefaultAsync(c => c.Name == model.Category);

                if (category == null)
                    return BadRequest($"Category '{model.Category}' not found.");

                string imageUrl = null;

                // Handle optional image upload
                if (model.Image != null && model.Image.Length > 0)
                {
                    // Save to wwwroot/uploads folder
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var fileName = $"{Guid.NewGuid()}_{model.Image.FileName}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await model.Image.CopyToAsync(stream);
                    }

                    imageUrl = $"/uploads/{fileName}";
                }

                var newItem = new MenuItem
                {
                    Name = model.Name,
                    Description = model.Description,
                    Price = model.Price,
                    ImageUrl = imageUrl,
                    CategoryId = category.CategoryId,
                    IsAvailable = model.IsActive
                };

                _context.MenuItems.Add(newItem);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(CreateMenuItem), new { id = newItem.ItemId }, newItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating menu item: {ex.Message}");
            }
        }
    }

}
