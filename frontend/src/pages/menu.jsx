import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicNavigation from '../components/dynamicNavbar';
import bowlImage from '../assets/BOWL.png';
import bgImage from '../assets/MAIN4.png';
import axios from 'axios'

const Menu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemsRes] = await Promise.all([
          axios.get('http://localhost:5143/api/menu/categories'),
          axios.get('http://localhost:5143/api/menu')
        ]);
        const allItemsCategory = { categoryId: 0, name: 'All Items' };
  
        setCategories([allItemsCategory, ...catRes.data]);
        setMenuItems(itemsRes.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  },[])
  
  // Filter menu items based on category and search
  const filteredItems = menuItems.filter(item => {
    // if "All Items" is chosen, always true
    const matchesCategory =
      selectedCategory === 'All Items'
        ? true
        : item.categoryId === categories.find(cat => cat.name === selectedCategory)?.id 
          || item.categoryId === categories.find(cat => cat.name === selectedCategory)?.categoryId;

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Navigation */}
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      {/* Hero Section with Background Image - Title Only */}
      <div 
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <div className="text-center max-w-4xl">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Select a Category
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed px-4 max-w-3xl mx-auto">
            Choose from our different food categories and find the perfect Filipino dish to satisfy your cravings
          </p>
        </div>
      </div>

      {/* Category Selection Section - Floating between backgrounds */}
      <div className="relative -mt-16 mb-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => {
              const getIcon = (categoryName) => {
                switch(categoryName) {
                  case 'All Items':
                  case 'Appetizer':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    );
                  case 'Main Course':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12.88 11.53z"/>
                      </svg>
                    );
                  case 'Dessert':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    );
                  case 'Beverages':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z"/>
                      </svg>
                    );
                  default:
                    return category.icon;
                }
              };

              return (
                <button
                  key={category.id || `custom-${category.name}`}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 ${
                    selectedCategory === category.name 
                      ? 'ring-2 ring-yellow-400/50 ' 
                      : 'hover: bg-gray-50 hover:shadow-lg transition-all duration-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      {getIcon(category.name)}
                    </div>
                    <h3 className="text-yellow-400 font-bold text-lg sm:text-xl">
                      {category.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-12 sm:mb-16 gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Category: <span className="text-yellow-500">{selectedCategory}</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full lg:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {/* Item Image */}
                  <div className="relative h-48 sm:h-56 bg-yellow-500 flex items-center justify-center overflow-hidden rounded-t-2xl">
                    <img 
                      src={bowlImage}
                      alt={item.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    
                    {/* Price and Add Button */}
                    <div className="flex justify-between items-center">
                      <span className="bg-yellow-100 text-yellow-400 px-4 py-1.5 rounded-full font-bold text-md">
                        ₱ {item.price.toFixed(2)}
                      </span>
                      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 group">
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">Add Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Items Found */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or selecting a different category.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Items');
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gray-100 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
            Ready to <span className="text-yellow-500">Order?</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto">
            Found something delicious? Add your favorite items to your cart and enjoy authentic Filipino flavors delivered fresh to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m0 0L12 18m0 0l2.5-2.5M12 18l-2.5-2.5" />
              </svg>
              View Cart (0)
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-yellow-500 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {/* Logo and Description */}
            <div className="md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4 sm:mb-6">
                <h3 className="text-white text-2xl font-bold">Lamoy</h3>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><button onClick={() => navigate('/home')} className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Home</button></li>
                <li><button onClick={() => navigate('/menu')} className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Menu</button></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">About</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Contact</a></li>
              </ul>
            </div>

            {/* Our Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Our Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Terms</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Privacy</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Support</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Delivery</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li className="text-white/80 text-sm sm:text-base">lamoy@example.com</li>
                <li className="text-white/80 text-sm sm:text-base">+63 123 456 7890</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-white/80 text-sm sm:text-base">© 2025 Lamoy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Menu;