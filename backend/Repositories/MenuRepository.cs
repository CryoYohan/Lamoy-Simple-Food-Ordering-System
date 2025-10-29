using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class MenuRepository : IMenuRepository
    {
        private readonly ApplicationDBContext _context;

        public MenuRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<MenuCategory?> GetCategoryByNameAsync(string name)
        {
            return await _context.MenuCategories.FirstOrDefaultAsync(c => c.Name == name);
        }

        public async Task<MenuItem> CreateMenuItemAsync(MenuItem newItem)
        {
            _context.MenuItems.Add(newItem);
            await _context.SaveChangesAsync();
            return newItem;
        }

        public async Task<IEnumerable<MenuItem>> GetAllAvailableItemsAsync()
        {
            return await _context.MenuItems
                .Where(mi => mi.IsAvailable)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MenuCategory>> GetAllCategoriesAsync()
        {
            return await _context.MenuCategories
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MenuItem>> GetAvailableItemsByCategoryIdAsync(int categoryId)
        {
            return await _context.MenuItems
                .Where(mi => mi.CategoryId == categoryId && mi.IsAvailable)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MenuItem>> SearchAvailableItemsAsync(string query)
        {
            var lowerQuery = query.ToLower();
            return await _context.MenuItems
                .Where(mi => mi.IsAvailable &&
                      (mi.Name.ToLower().Contains(lowerQuery) ||
                       (mi.Description != null && mi.Description.ToLower().Contains(lowerQuery))))
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MenuItem?> GetItemByIdAsync(int id)
        {
            return await _context.MenuItems.FindAsync(id);
        }

        public async Task UpdateMenuItemAsync()
        {
            // Just save changes, as the service will have modified the tracked entity
            await _context.SaveChangesAsync();
        }
    }
}