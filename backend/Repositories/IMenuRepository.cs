using backend.Models;

namespace backend.Repositories
{
    public interface IMenuRepository
    {
        Task<MenuCategory?> GetCategoryByNameAsync(string name);
        Task<MenuItem> CreateMenuItemAsync(MenuItem newItem);

        Task<IEnumerable<MenuItem>> GetAllAvailableItemsAsync();
        Task<IEnumerable<MenuCategory>> GetAllCategoriesAsync();
        Task<IEnumerable<MenuItem>> GetAvailableItemsByCategoryIdAsync(int categoryId);
        Task<IEnumerable<MenuItem>> SearchAvailableItemsAsync(string query);
        
        Task<MenuItem?> GetItemByIdAsync(int id);
        Task UpdateMenuItemAsync(); // EF Core tracks changes, so we just need to save
    }
}