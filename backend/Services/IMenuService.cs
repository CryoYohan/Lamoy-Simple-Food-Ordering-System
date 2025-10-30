using backend.DTOs.admin; // For MenuItemCreateDto
using backend.DTOs.Menu;

namespace backend.Services
{
    public interface IMenuService
    {
        Task<MenuItemDto> CreateMenuItemAsync(MenuItemCreateDto dto);
        Task UpdateMenuItemAsync(int id, MenuItemUpdateDto dto);
        Task<IEnumerable<MenuItemDto>> GetAllAvailableItemsAsync();
        Task<IEnumerable<MenuItemDto>> GetAllAdminItemsAsync(); 
        Task<IEnumerable<MenuCategoryDto>> GetAllCategoriesAsync();
        Task<IEnumerable<MenuItemDto>> GetAvailableItemsByCategoryIdAsync(int categoryId);
        Task<IEnumerable<MenuItemDto>> SearchAvailableItemsAsync(string query);
        Task<MenuItemDto> GetMenuItemByIdAsync(int id);
        Task DeleteMenuItemAsync(int id);
    }
}

