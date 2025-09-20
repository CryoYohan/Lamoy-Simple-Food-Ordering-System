using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
        [ApiController]
        [Route("api/menu")]
        public class MenuController : ControllerBase
        {
            private readonly ApplicationDBContext _context;

            public MenuController(ApplicationDBContext context)
            {
                _context = context;
            }

            [HttpGet]
            public async Task<ActionResult> GetAllItems()
            {
               var items = await _context.MenuItems
                .Where(mi => mi.IsAvailable)
                .Select(mi => new
                {
                    mi.ItemId,
                    mi.Name,
                    mi.Description,
                    mi.Price,
                    mi.ImageUrl,
                    mi.CategoryId,
                    mi.IsAvailable
                })
                .ToListAsync();
                return Ok(items);
            }
            
            [HttpGet("categories")]
            public async Task<ActionResult> GetAllCategories()
            {
                var categories = await _context.MenuCategories.ToListAsync();
                return Ok(categories);
            }
        

            // GET: api/menu/category/{categoryId}
            [HttpGet("category/{categoryId}")]
            public async Task<ActionResult> GetMenuItemsByCategory(int categoryId)
            {
                var items = await _context.MenuItems
                    .Where(mi => mi.CategoryId == categoryId && mi.IsAvailable)
                    .ToListAsync();
                return Ok(items);
            }

            // GET: api/menu/search?query=xxx
            [HttpGet("search")]
            public async Task<ActionResult> SearchMenuItems([FromQuery] string query)
            {
                if (string.IsNullOrWhiteSpace(query))
                    return BadRequest("Query parameter is required.");

                var items = await _context.MenuItems
                    .Where(mi => mi.IsAvailable &&
                        (EF.Functions.Like(mi.Name, $"%{query}%") ||
                         EF.Functions.Like(mi.Description, $"%{query}%")))
                    .ToListAsync();
                return Ok(items);
            }
        }
}