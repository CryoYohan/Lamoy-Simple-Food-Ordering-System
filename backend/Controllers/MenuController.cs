using backend.DTOs.admin;
using backend.DTOs.Menu;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/menu")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        // Only inject the service
        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        // --- ADMIN-ONLY ENDPOINTS ---

        [HttpPost]
        [Authorize(Roles = "Admin")] // Protected!
        public async Task<ActionResult<MenuItemDto>> CreateMenuItem([FromForm] MenuItemCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Logic is now in the service
            // Middleware will catch "Category not found" exceptions
            var createdItem = await _menuService.CreateMenuItemAsync(dto);
            
            // Return a 201 Created with the new item
            return CreatedAtAction(nameof(GetMenuItemById), new { id = createdItem.ItemId }, createdItem);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Protected!
        public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] MenuItemUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Middleware will catch "Item not found" exceptions
            await _menuService.UpdateMenuItemAsync(id, dto);
            return NoContent(); // 204 No Content is standard for a successful PUT
        }
        
        // --- PUBLIC ENDPOINTS ---

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> GetAllItems()
        {
            var items = await _menuService.GetAllAvailableItemsAsync();
            return Ok(items);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<MenuCategoryDto>>> GetAllCategories()
        {
            var categories = await _menuService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> GetMenuItemsByCategory(int categoryId)
        {
            var items = await _menuService.GetAvailableItemsByCategoryIdAsync(categoryId);
            return Ok(items);
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> SearchMenuItems([FromQuery] string query)
        {
            // Middleware will catch the "Query required" exception
            var items = await _menuService.SearchAvailableItemsAsync(query);
            return Ok(items);
        }

        // Helper endpoint for the CreatedAtAction
        // Not strictly required by your old code, but good practice
        [HttpGet("{id}")]
        public async Task<ActionResult<MenuItemDto>> GetMenuItemById(int id)
        {
            // This service method/repo method doesn't exist yet,
            // but you would add it following the same pattern
            // var item = await _menuService.GetItemByIdAsync(id);
            // if (item == null) return NotFound();
            // return Ok(item);
            
            // For now, we'll just return Ok to make CreatedAtAction work
            return Ok("Endpoint not fully implemented, but needed for 201 Created.");
        }
    }
}