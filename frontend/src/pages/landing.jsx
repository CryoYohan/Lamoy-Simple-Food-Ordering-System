import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/navbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import food2Image from '../assets/BOWL1.png'; 
import food3Image from '../assets/BOWL2.png';
import logoImage from '../assets/LOGO1.png';
import kareImage from '../assets/KARE.jpg';
import lechonImage from '../assets/LETCHON.jpg';
import pancitImage from '../assets/PANCIT.jpg';
import adoboImage from '../assets/ADOBO.jpg';


const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    carousel: false,
    whyChoose: false,
    about: false,
    products: false,
    whatsCooking: false,
    readyToStart: false
  });

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.dataset.section]: true
            }));
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections with data-section attribute
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  // Set hero section visible immediately on mount
  useEffect(() => {
    setIsVisible(prev => ({ ...prev, hero: true }));
  }, []);

  // Array of different food items
  const foods = [
    { id: 1, image: bowlImage, name: "Pancit Canton" },
    { id: 2, image: food2Image, name: "Adobo Rice" },
    { id: 3, image: food3Image, name: "Sisig Platter" }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % foods.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + foods.length) % foods.length);
  };

  // Helper function to get previous and next food items
  const getPrevFood = () => foods[(currentSlide - 1 + foods.length) % foods.length];
  const getCurrentFood = () => foods[currentSlide];
  const getNextFood = () => foods[(currentSlide + 1) % foods.length];

  return (
    <div className="font-sans">
      {/* First Section with MAIN4.png background */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with MAIN4.png only for first section */}
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      
        {/* Navigation */}
        <div className="absolute w-full z-50">
          <Navigation />
        </div>
        

        {/* Main Content Container */}
        <div className="relative z-10 min-h-screen flex flex-col pt-32">
        {/* Upper half with hero content */}
        <div 
          className={`flex-1 flex flex-col items-center justify-center px-4 mb-12 transition-all duration-1000 ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="hero"
        >
          {/* Hero Text */}
          <div className="text-center mb-8 max-w-4xl">
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-6">
              Welcome to Lamoy!
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed">
              Craving something delicious? Lamoy makes it easy to order your favorite<br />
              Filipino meals—quick, simple, and hassle-free, anytime, anywhere.
            </p>
          </div>
        </div>

        {/* Food Carousel Section */}
        <div 
          className={`relative flex items-center justify-center pb-40 transition-all duration-1000 ${
            isVisible.carousel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="carousel"
        >          
          {/* Large background circle layer to match image */}
          <div className="absolute w-[600px] h-[600px] bg-white/20 backdrop-blur-sm rounded-full transition-all duration-700 ease-in-out"></div>
          
          {/* Navigation arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 md:left-130 top-1/3 transform -translate-y-1/10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 md:right-130 top-1/3 transform -translate-y-1/10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Container */}
            <div className="relative">
            {/* Main center plate - Current food */}
            <div className="relative z-10 w-[28rem] h-[28rem] md:w-[32rem] md:h-[32rem] bg-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-700 ease-in-out">
                <img 
                src={getCurrentFood().image} 
                alt={getCurrentFood().name}
                className="w-[26rem] h-[26rem] md:w-[30rem] md:h-[30rem] object-contain transition-all duration-700 ease-in-out transform"
                style={{
                  transform: 'scale(1)',
                  opacity: 1
                }}
                key={currentSlide}
                />
            </div>

            {/* Left side dish - Previous food */}
            <div className="absolute left-[-70px] md:left-[-90px] top-1/2 transform -translate-y-1/2 w-36 h-36 md:w-40 md:h-40 bg-white rounded-full shadow-lg flex items-center justify-center z-5 transition-all duration-700 ease-in-out">
                <img 
                src={getPrevFood().image} 
                alt={getPrevFood().name}
                className="w-32 h-32 md:w-36 md:h-36 object-contain opacity-80 transition-all duration-700 ease-in-out"
                />
            </div>

            {/* Right side dish - Next food */}
            <div className="absolute right-[-70px] md:right-[-90px] top-1/2 transform -translate-y-1/2 w-36 h-36 md:w-40 md:h-40 bg-white rounded-full shadow-lg flex items-center justify-center z-5 transition-all duration-700 ease-in-out">
                <img 
                src={getNextFood().image} 
                alt={getNextFood().name}
                className="w-32 h-32 md:w-36 md:h-36 object-contain opacity-80 transition-all duration-700 ease-in-out"
                />
            </div>
            </div>

            {/* Carousel indicators - 3 circles at bottom for navigation */}
            <div className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 flex space-x-4">
            {foods.map((food, index) => (
                <button
                key={food.id}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                    ? 'bg-white shadow-lg scale-125' 
                    : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                }`}
                />
            ))}
            </div>
        </div>
        </div>
      </div>

      {/* Why Choose Lamoy Section */}
      <div className="bg-white py-35 px-4">
        <div 
          className={`max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="whyChoose"
        >
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose <span className="text-yellow-500">Lamoy</span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Filipino Flavors */}
            <div className={`text-center group transition-all duration-1000 ${
              isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '0ms' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12.88 11.53z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Filipino Flavors</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enjoy the rich taste of local dishes<br />
                you know and love.
              </p>
            </div>

            {/* Fast and Easy */}
            <div className={`text-center group transition-all duration-1000 ${
              isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 5.5L11 1 9.5 2.5 13 6 2 17h3l1.5-1.5L9 13l1.5-1.5L14 15l1.5-1.5L12 10l1.5-1.5L17 12l1.5-1.5L15.5 7V5.5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Fast and Easy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get your food in just a few taps,<br />
                anytime, anywhere.
              </p>
            </div>

            {/* For Every Craving */}
            <div className={`text-center group transition-all duration-1000 ${
              isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">For Every Craving</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From classic comfort meals to<br />
                quick bites, we've got you covered.
              </p>
            </div>

            {/* Convenient & Reliable */}
            <div className={`text-center group transition-all duration-1000 ${
              isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '600ms' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Convenient & Reliable</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No more long lines or waiting —<br />
                Lamoy makes eating easier.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Lamoy Section */}
      <div className="bg-gray-50 py-35 px-4">
        <div 
          className={`max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="about"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className={`transition-all duration-1000 ${
              isVisible.about ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`} style={{ transitionDelay: '0ms' }}>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                About <span className="text-yellow-500">Lamoy</span>
              </h2>
              <div className="w-20 h-1 bg-yellow-500 mb-6"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Lamoy is a simple and reliable food ordering system designed to bring delicious Filipino meals closer to you. Our goal is to make ordering food quick, hassle-free, and enjoyable. With just a few taps, you can explore your favorite local dishes, place an order, and have it ready for you—anytime, anywhere.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300">
                Learn More
              </button>
            </div>

            {/* Right side - Lamoy logo/illustration */}
            <div className={`flex justify-center transition-all duration-1000 ${
              isVisible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`} style={{ transitionDelay: '300ms' }}>
              <div className="w-80 h-80 bg-yellow-500 rounded-3xl flex items-center justify-center shadow-lg">
                <img 
                  src={logoImage} 
                  alt="Lamoy Logo"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Top Products Section */}
      <div className="bg-white py-35 px-4">
        <div 
          className={`max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="products"
        >
          {/* Section Header */}
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
              Our Top <span className="text-yellow-500">Products</span>
            </h2>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300">
              View Menu
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-1000 ${
              isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '0ms' }}>
              <div className="h-48 bg-yellow-500 flex items-center justify-center">
                <img 
                  src={bowlImage} 
                  alt="Pancit"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Pancit</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-500">₱ 80.00</span>
                  <button className="w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-1000 ${
              isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '200ms' }}>
              <div className="h-48 bg-yellow-500 flex items-center justify-center">
                <img 
                  src={food2Image} 
                  alt="Pancit"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Pancit</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-500">₱ 80.00</span>
                  <button className="w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-1000 ${
              isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="h-48 bg-yellow-500 flex items-center justify-center">
                <img 
                  src={food3Image} 
                  alt="Pancit"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Pancit</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-500">₱ 80.00</span>
                  <button className="w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Cooking Section */}
      <div className="bg-gray-50 py-35 px-4">
        <div 
          className={`max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible.whatsCooking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="whatsCooking"
        >
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              What's <span className="text-yellow-500">Cooking</span>
            </h2>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto h-[600px]">
            {/* Large Card 1 - Kare-Kare */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative">
              <div className="h-full bg-gradient-to-br from-amber-400 to-orange-600 relative overflow-hidden">
                <img 
                  src={kareImage} 
                  alt="Kare-Kare"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                  <h3 className="text-white text-3xl md:text-4xl font-bold mb-2">
                    Kare-Kare
                  </h3>
                  <p className="text-white/90 text-sm mb-1">Chef Elena's Traditional</p>
                  <p className="text-white/80 text-base max-w-lg">
                    A rich and creamy peanut-based stew with tender oxtail, beef tripe, and fresh vegetables. 
                    Served with bagoong (shrimp paste) for that authentic Filipino flavor.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Card 1 - Lechon */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative">
              <div className="h-full bg-gradient-to-br from-orange-400 to-red-600 relative overflow-hidden">
                <img 
                  src={lechonImage} 
                  alt="Lechon"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                    Lechon Kawali
                  </h3>
                  <p className="text-white/90 text-xs mb-1">Chef Carlos's Specialty</p>
                  <p className="text-white/80 text-sm">
                    Perfectly roasted whole pig with crispy skin and succulent meat. A Filipino celebration favorite.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Card 2 - Pancit */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative">
              <div className="h-full bg-gradient-to-br from-green-400 to-emerald-600 relative overflow-hidden">
                <img 
                  src={pancitImage} 
                  alt="Pancit"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                    Pancit Canton
                  </h3>
                  <p className="text-white/90 text-xs mb-1">Chef Maria's Special</p>
                  <p className="text-white/80 text-sm">
                    Stir-fried wheat noodles with mixed vegetables, shrimp, and your choice of meat.
                  </p>
                </div>
              </div>
            </div>

            {/* Large Card 2 - Adobo */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative">
              <div className="h-full bg-gradient-to-br from-purple-400 to-indigo-600 relative overflow-hidden">
                <img 
                  src={adoboImage} 
                  alt="Adobo"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                  <h3 className="text-white text-3xl md:text-4xl font-bold mb-2">
                    Chicken Adobo
                  </h3>
                  <p className="text-white/90 text-sm mb-1">Chef Juan's Classic</p>
                  <p className="text-white/80 text-base max-w-lg">
                    The Philippines' national dish! Tender chicken braised in soy sauce, vinegar, and garlic. 
                    Served with steamed rice for the perfect comfort meal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to get Started Section */}
      <div className="bg-white py-50 px-4">
        <div 
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible.readyToStart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="readyToStart"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ready to get <span className="text-yellow-500">Started?</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            Join Lamoy today and enjoy quick, easy access to your favorite<br />
            Filipino meals—anytime, anywhere.
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-yellow-500 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-6">
                <img 
                  src={logoImage} 
                  alt="Lamoy Logo"
                  className="w-50 h-50 mr-3 "
                />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Home</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Menu</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">About</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Contact</a></li>
              </ul>
            </div>

            {/* Our Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Our Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Terms</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Privacy</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Support</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200">Delivery</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-white/80">lamoy@example.com</li>
                <li className="text-white/80">+63 123 456 7890</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-white/80">© 2025 Lamoy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;