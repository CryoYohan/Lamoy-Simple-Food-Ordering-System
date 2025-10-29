using backend.DTOs.admin;
using backend.DTOs.Menu;
using backend.Models;
using backend.Repositories;
using Microsoft.Extensions.Logging; 

namespace backend.Services
{
    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IFileStorageService _fileStorageService;
        private readonly ILogger<MenuService> _logger; 

        public MenuService(IMenuRepository menuRepository, IFileStorageService fileStorageService, ILogger<MenuService> logger)
        {
            _menuRepository = menuRepository;
            _fileStorageService = fileStorageService;
            _logger = logger;
        }

        public async Task<MenuItemDto> CreateMenuItemAsync(MenuItemCreateDto dto)
        {
            _logger.LogInformation("Attempting to create menu item: {Name}", dto.Name);

            // 1. Validate Category
            var category = await _menuRepository.GetCategoryByNameAsync(dto.Category);
            if (category == null)
            {
                _logger.LogWarning("Failed to create menu item: Category {Category} not found.", dto.Category);
                throw new InvalidOperationException($"Category '{dto.Category}' not found.");
            }

            // 2. Handle Image Upload
            string? imageUrl = null;
            if (dto.Image != null && dto.Image.Length > 0)
            {
                _logger.LogInformation("Uploading image for new menu item {Name}", dto.Name);
                imageUrl = await _fileStorageService.SaveFileAsync(dto.Image, "uploads");
                _logger.LogInformation("Image saved at {ImageUrl}", imageUrl);
            }

            // 3. Create Model
            var newItem = new MenuItem
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = imageUrl,
                CategoryId = category.CategoryId,
                IsAvailable = dto.IsActive
            };

            // 4. Save to DB
            var createdItem = await _menuRepository.CreateMenuItemAsync(newItem);
            
            _logger.LogInformation("Menu item {Name} created successfully with ID {ItemId}", createdItem.Name, createdItem.ItemId);

            // 5. Return DTO
            return MapToMenuItemDto(createdItem);
        }

        public async Task UpdateMenuItemAsync(int id, MenuItemUpdateDto dto)
        {
            _logger.LogInformation("Attempting to update menu item with ID: {ItemId}", id);

            // 1. Get existing item
            var existingItem = await _menuRepository.GetItemByIdAsync(id);
            if (existingItem == null)
            {
                _logger.LogWarning("Failed to update: Menu item with ID {ItemId} not found.", id);
                throw new KeyNotFoundException("Menu item not found.");
            }

            // 2. Map updated fields
            existingItem.Name = dto.Name;
            existingItem.Description = dto.Description;
            existingItem.Price = dto.Price;
            existingItem.ImageUrl = dto.ImageUrl;
            existingItem.CategoryId = dto.CategoryId;
            existingItem.IsAvailable = dto.IsAvailable;

            // 3. Save changes
            await _menuRepository.UpdateMenuItemAsync();
            
            _logger.LogInformation("Menu item {ItemId} updated successfully.", id);
        }

        public async Task<IEnumerable<MenuItemDto>> GetAllAvailableItemsAsync()
        {
            _logger.LogInformation("Fetching all available menu items");
            var items = await _menuRepository.GetAllAvailableItemsAsync();
            return items.Select(MapToMenuItemDto);
        }

        public async Task<IEnumerable<MenuCategoryDto>> GetAllCategoriesAsync()
        {
             _logger.LogInformation("Fetching all menu categories");
            var categories = await _menuRepository.GetAllCategoriesAsync();
            return categories.Select(c => new MenuCategoryDto { CategoryId = c.CategoryId, Name = c.Name });
        }

        public async Task<IEnumerable<MenuItemDto>> GetAvailableItemsByCategoryIdAsync(int categoryId)
        {
            _logger.LogInformation("Fetching available items for category ID: {CategoryId}", categoryId);
            var items = await _menuRepository.GetAvailableItemsByCategoryIdAsync(categoryId);
            return items.Select(MapToMenuItemDto);
        }

        public async Task<IEnumerable<MenuItemDto>> SearchAvailableItemsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogWarning("Search failed: Query parameter was empty or whitespace.");
                throw new InvalidOperationException("Query parameter is required.");
            }
            
            _logger.LogInformation("Searching for menu items with query: {Query}", query);
            var items = await _menuRepository.SearchAvailableItemsAsync(query);
            return items.Select(MapToMenuItemDto);
        }

        // --- Helper method for mapping ---
        private MenuItemDto MapToMenuItemDto(MenuItem item)
        {
            // Helper methods typically don't need logs
            return new MenuItemDto
            {
                ItemId = item.ItemId,
                Name = item.Name,
                Description = item.Description ?? string.Empty,
                Price = item.Price,
                ImageUrl = item.ImageUrl,
                CategoryId = item.CategoryId,
                IsAvailable = item.IsAvailable
            };
        }
    }
}