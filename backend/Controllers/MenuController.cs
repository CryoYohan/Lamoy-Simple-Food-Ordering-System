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
        private readonly ILogger<MenuController> _logger; // Added logger

        // Only inject the service and logger
        public MenuController(IMenuService menuService, ILogger<MenuController> logger)
        {
            _menuService = menuService;
            _logger = logger;
        }

        // --- ADMIN-ONLY ENDPOINTS ---

        [HttpPost]
        [Authorize(Roles = "Admin")] // Protected!
        public async Task<ActionResult<MenuItemDto>> CreateMenuItem([FromForm] MenuItemCreateDto dto)
        {
             _logger.LogInformation("Received request to create menu item: {Name}", dto.Name);
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("CreateMenuItem failed: Invalid model state.");
                return BadRequest(ModelState);
            }
            // Logic is now in the service
            // Middleware will catch "Category not found" or file saving exceptions
            var createdItem = await _menuService.CreateMenuItemAsync(dto);

            // Return a 201 Created with the new item DTO
            // Use GetMenuItemById action name for the location header
            return CreatedAtAction(nameof(GetMenuItemById), new { id = createdItem.ItemId }, createdItem);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Protected!
        public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] MenuItemUpdateDto dto)
        {
            _logger.LogInformation("Received request to update menu item with ID: {ItemId}", id);
            if (!ModelState.IsValid)
            {
                 _logger.LogWarning("UpdateMenuItem failed for ID {ItemId}: Invalid model state.", id);
                return BadRequest(ModelState);
            }
            // Service handles KeyNotFoundException
            await _menuService.UpdateMenuItemAsync(id, dto);
             _logger.LogInformation("Successfully updated menu item {ItemId}.", id);
            return NoContent(); // 204 No Content is standard for a successful PUT
        }

        // --- DELETE ENDPOINT ---
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Protected!
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            _logger.LogInformation("Received request to delete menu item with ID: {ItemId}", id);
            // Service handles KeyNotFoundException
            await _menuService.DeleteMenuItemAsync(id);
             _logger.LogInformation("Successfully deleted menu item {ItemId}.", id);
            return NoContent(); // 204 No Content is standard for successful DELETE
        }
        // -------------------------

        // --- PUBLIC ENDPOINTS ---

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> GetAllItems()
        {
             _logger.LogInformation("Received request to get all available menu items.");
            var items = await _menuService.GetAllAvailableItemsAsync();
            return Ok(items);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<MenuCategoryDto>>> GetAllCategories()
        {
             _logger.LogInformation("Received request to get all menu categories.");
            var categories = await _menuService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> GetMenuItemsByCategory(int categoryId)
        {
             _logger.LogInformation("Received request to get menu items by category ID: {CategoryId}", categoryId);
            var items = await _menuService.GetAvailableItemsByCategoryIdAsync(categoryId);
            return Ok(items);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<MenuItemDto>>> SearchMenuItems([FromQuery] string query)
        {
             _logger.LogInformation("Received request to search menu items with query: {Query}", query);
            // Service handles empty query check
            var items = await _menuService.SearchAvailableItemsAsync(query);
            return Ok(items);
        }

        // GET: api/menu/{id} - Public or Protected? Assumed public/protected for now
        // This endpoint is used by CreateMenuItem's CreatedAtAction
        // Also needed for the Edit page to fetch initial data
        [HttpGet("{id}")]
        [AllowAnonymous] // Or [Authorize] if only admins/users should fetch single items
        public async Task<ActionResult<MenuItemDto>> GetMenuItemById(int id)
        {
            _logger.LogInformation("Received request to get menu item by ID: {ItemId}", id);
            // --- FIX START ---
            // Service handles KeyNotFoundException
            var item = await _menuService.GetMenuItemByIdAsync(id);
            // Return the actual DTO, which will be serialized to JSON
            return Ok(item);
            // --- FIX END ---
        }
    }
}

