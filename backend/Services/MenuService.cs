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

        // --- ADD/CONFIRM GetMenuItemByIdAsync ---
        public async Task<MenuItemDto> GetMenuItemByIdAsync(int id)
        {
            _logger.LogInformation("Fetching menu item by ID: {ItemId}", id);
            // Use the repository method that gets a tracked entity if you plan to update immediately after,
            // or use a non-tracked one if just viewing. Let's assume GetItemByIdAsync might track.
            var item = await _menuRepository.GetItemByIdAsync(id);

            if (item == null)
            {
                _logger.LogWarning("Menu item with ID {ItemId} not found.", id);
                throw new KeyNotFoundException("Menu item not found.");
            }

             _logger.LogInformation("Successfully fetched menu item {ItemId}.", id);
            return MapToMenuItemDto(item); // Use the existing mapping helper
        }
        // ------------------------------------


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
                try
                {
                    imageUrl = await _fileStorageService.SaveFileAsync(dto.Image, "uploads");
                    _logger.LogInformation("Image saved at {ImageUrl}", imageUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error saving image for menu item {Name}", dto.Name);
                    // Decide if image error should prevent item creation or just save without image
                    throw new InvalidOperationException("Failed to save image.", ex);
                }
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

            // 1. Get existing item (EF Core tracks this entity)
            var existingItem = await _menuRepository.GetItemByIdAsync(id);
            if (existingItem == null)
            {
                _logger.LogWarning("Failed to update: Menu item with ID {ItemId} not found.", id);
                throw new KeyNotFoundException("Menu item not found.");
            }

             // Optional: Validate CategoryId exists if it's being changed
             // var categoryExists = await _menuRepository.CategoryExistsByIdAsync(dto.CategoryId);
             // if (!categoryExists) throw new InvalidOperationException("Invalid Category ID provided.");


            // 2. Map updated fields onto the tracked entity
            existingItem.Name = dto.Name;
            existingItem.Description = dto.Description;
            existingItem.Price = dto.Price;
            // Handle ImageUrl update: If dto.ImageUrl is explicitly provided, use it.
            // If it's omitted or null maybe keep the existing one? Decide update logic.
            // For simplicity here, we assume the DTO provides the desired final URL or null.
            existingItem.ImageUrl = dto.ImageUrl;
            existingItem.CategoryId = dto.CategoryId;
            existingItem.IsAvailable = dto.IsAvailable;

            // 3. Save changes (EF Core detects changes on the tracked entity)
            await _menuRepository.UpdateMenuItemAsync();

            _logger.LogInformation("Menu item {ItemId} updated successfully.", id);
        }

        // --- ADD DeleteMenuItemAsync IMPLEMENTATION ---
        public async Task DeleteMenuItemAsync(int id)
        {
            _logger.LogInformation("Attempting to delete menu item with ID: {ItemId}", id);

            // 1. Get the item to ensure it exists before deleting
            var itemToDelete = await _menuRepository.GetItemByIdAsync(id);
            if (itemToDelete == null)
            {
                _logger.LogWarning("Failed to delete: Menu item with ID {ItemId} not found.", id);
                throw new KeyNotFoundException("Menu item not found.");
            }

            // Optional: Add business logic here. E.g., check if the item is part of any non-completed orders?
            // If so, maybe prevent deletion or mark as unavailable instead.
            // For now, we proceed with direct deletion.

            // 2. Call the repository to delete the item
            await _menuRepository.DeleteMenuItemAsync(itemToDelete);

            // Optional: Delete associated image file from wwwroot/uploads
            // try {
            //     if (!string.IsNullOrEmpty(itemToDelete.ImageUrl)) {
            //         _fileStorageService.DeleteFile(itemToDelete.ImageUrl); // Assuming FileStorageService has a Delete method
            //         _logger.LogInformation("Deleted image file {ImageUrl} for item {ItemId}", itemToDelete.ImageUrl, id);
            //     }
            // } catch (Exception ex) {
            //      _logger.LogError(ex, "Error deleting image file {ImageUrl} for item {ItemId}", itemToDelete.ImageUrl, id);
            //      // Don't throw - deleting the item record is the main goal
            // }


            _logger.LogInformation("Menu item {ItemId} deleted successfully.", id);
        }
        // ------------------------------------------

        public async Task<IEnumerable<MenuItemDto>> GetAllAvailableItemsAsync()
        {
            _logger.LogInformation("Fetching all available menu items");
            var items = await _menuRepository.GetAllAvailableItemsAsync();
            return items.Select(MapToMenuItemDto); // Map each item to a DTO
        }

        // --- ADD GET ALL MENU ITEMS METHOD FOR ADMIN ---
        public async Task<IEnumerable<MenuItemDto>> GetAllAdminItemsAsync()
        {
            _logger.LogInformation("Fetching ALL menu items for admin");
            // Call the new repository method
            var items = await _menuRepository.GetAllAdminItemsAsync(); 
            // Map using the standard helper (no CategoryName needed)
            return items.Select(MapToMenuItemDto); 
        }
        // --------------------------------

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

