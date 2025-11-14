import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicNavigation from '../components/dynamicNavbar';
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
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
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
    if (isSliding) return;
    setIsSliding(true);
    setSlideDirection('next');
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % foods.length);
      setIsSliding(false);
    }, 300);
  };

  const prevSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setSlideDirection('prev');
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + foods.length) % foods.length);
      setIsSliding(false);
    }, 300);
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
          <DynamicNavigation />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 min-h-screen flex flex-col pt-20 sm:pt-24 md:pt-32">
          {/* Upper half with hero content */}
          <div
            className={`flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            data-section="hero"
          >
            {/* Hero Text */}
            <div className="text-center mb-6 sm:mb-8 max-w-4xl">
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
                Welcome to Lamoy!
              </h1>
              <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed px-4 max-w-3xl mx-auto">
                Craving something delicious? Lamoy makes it easy to order your favorite
                <span className="hidden sm:inline"><br /></span>
                <span className="sm:hidden"> </span>
                Filipino meals—quick, simple, and hassle-free, anytime, anywhere.
              </p>
            </div>
          </div>

          {/* Food Carousel Section */}
          <div
            className={`relative flex items-center justify-center pb-20 sm:pb-32 md:pb-40 px-4 transition-all duration-1000 ${isVisible.carousel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            data-section="carousel"
          >
            {/* Large background circle layer to match image */}
            <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-white/20 backdrop-blur-sm rounded-full transition-all duration-700 ease-in-out"></div>

            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              disabled={isSliding}
              className="absolute left-2 sm:left-4 md:left-8 lg:left-32 top-1/3 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 z-20"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              disabled={isSliding}
              className="absolute right-2 sm:right-4 md:right-8 lg:right-32 top-1/3 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 z-20"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Carousel Container */}
            <div className="relative">
              {/* Main center plate - Current food with animations */}
              <div className="relative z-10 w-[18rem] h-[18rem] sm:w-[22rem] sm:h-[22rem] md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] bg-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-700 ease-in-out overflow-hidden">
                <img 
                  src={getCurrentFood().image} 
                  alt={getCurrentFood().name}
                  className={`w-[16rem] h-[16rem] sm:w-[20rem] sm:h-[20rem] md:w-[26rem] md:h-[26rem] lg:w-[30rem] lg:h-[30rem] object-contain transition-all duration-500 ease-out ${
                    isSliding 
                      ? slideDirection === 'next' 
                        ? 'opacity-0 scale-75 -translate-x-full' 
                        : 'opacity-0 scale-75 translate-x-full'
                      : 'opacity-100 scale-100 translate-x-0'
                  }`}
                  key={currentSlide}
                />
              </div>

              {/* Left side dish - Previous food with hover scale */}
              <div className="absolute left-[-50px] sm:left-[-60px] md:left-[-70px] lg:left-[-90px] top-1/2 transform -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white rounded-full shadow-lg flex items-center justify-center z-5 transition-all duration-500 ease-in-out hover:scale-110 cursor-pointer"
                onClick={prevSlide}
              >
                <img 
                  src={getPrevFood().image} 
                  alt={getPrevFood().name}
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain opacity-80 hover:opacity-100 transition-all duration-500 ease-in-out"
                />
              </div>

              {/* Right side dish - Next food with hover scale */}
              <div className="absolute right-[-50px] sm:right-[-60px] md:right-[-70px] lg:right-[-90px] top-1/2 transform -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white rounded-full shadow-lg flex items-center justify-center z-5 transition-all duration-500 ease-in-out hover:scale-110 cursor-pointer"
                onClick={nextSlide}
              >
                <img 
                  src={getNextFood().image} 
                  alt={getNextFood().name}
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain opacity-80 hover:opacity-100 transition-all duration-500 ease-in-out"
                />
              </div>
            </div>

            {/* Carousel indicators - Enhanced with transitions */}
            <div className="absolute bottom-[-60px] sm:bottom-[-70px] md:bottom-[-80px] left-1/2 transform -translate-x-1/2 flex space-x-3 sm:space-x-4">
              {foods.map((food, index) => (
                <button
                  key={food.id}
                  onClick={() => {
                    if (isSliding || index === currentSlide) return;
                    setIsSliding(true);
                    setSlideDirection(index > currentSlide ? 'next' : 'prev');
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsSliding(false);
                    }, 300);
                  }}
                  disabled={isSliding || index === currentSlide}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-white shadow-lg scale-125' 
                      : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                  } ${isSliding ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Lamoy Section */}
      <div className="bg-white py-16 sm:py-24 md:py-32 lg:py-35 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          data-section="whyChoose"
        >
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-4">
              Why Choose <span className="text-yellow-500">Lamoy</span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Filipino Flavors */}
            <div className={`text-center group transition-all duration-1000 px-4 ${isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '0ms' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12.88 11.53z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Filipino Flavors</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Enjoy the rich taste of local dishes you know and love.
              </p>
            </div>

            {/* Fast and Easy */}
            <div className={`text-center group transition-all duration-1000 px-4 ${isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '200ms' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 5.5L11 1 9.5 2.5 13 6 2 17h3l1.5-1.5L9 13l1.5-1.5L14 15l1.5-1.5L12 10l1.5-1.5L17 12l1.5-1.5L15.5 7V5.5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Fast and Easy</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Get your food in just a few taps, anytime, anywhere.
              </p>
            </div>

            {/* For Every Craving */}
            <div className={`text-center group transition-all duration-1000 px-4 ${isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '400ms' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">For Every Craving</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                From classic comfort meals to quick bites, we've got you covered.
              </p>
            </div>

            {/* Convenient & Reliable */}
            <div className={`text-center group transition-all duration-1000 px-4 ${isVisible.whyChoose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '600ms' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-white-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors border border-gray-200 duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Convenient & Reliable</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                No more long lines or waiting — Lamoy makes eating easier.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Lamoy Section */}
      <div className="bg-gray-50 py-16 sm:py-24 md:py-32 lg:py-35 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          data-section="about"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left side - Text content */}
            <div className={`transition-all duration-1000 order-2 lg:order-1 ${isVisible.about ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`} style={{ transitionDelay: '0ms' }}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
                About <span className="text-yellow-500">Lamoy</span>
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-yellow-500 mb-4 sm:mb-6"></div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                Lamoy is a simple and reliable food ordering system designed to bring delicious Filipino meals closer to you. Our goal is to make ordering food quick, hassle-free, and enjoyable. With just a few taps, you can explore your favorite local dishes, place an order, and have it ready for you—anytime, anywhere.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-colors duration-300 text-sm sm:text-base">
                Learn More
              </button>
            </div>

            {/* Right side - Lamoy logo/illustration */}
            <div className={`flex justify-center order-1 lg:order-2 transition-all duration-1000 ${isVisible.about ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`} style={{ transitionDelay: '300ms' }}>
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-yellow-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
                <img
                  src={logoImage}
                  alt="Lamoy Logo"
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Top Products Section */}
      <div className="bg-white py-16 sm:py-24 md:py-32 lg:py-35 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          data-section="products"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 sm:mb-16 gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center sm:text-left">
              Our Top <span className="text-yellow-500">Products</span>
            </h2>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-colors duration-300 text-sm sm:text-base whitespace-nowrap">
              View Menu
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Product Card 1 */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-1000 ${isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '0ms' }}>
              <div className="h-40 sm:h-48 bg-yellow-500 flex items-center justify-center">
                <img
                  src={bowlImage}
                  alt="Pancit"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Pancit Canton</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  A classic Filipino stir-fried noodle dish loaded with vegetables, meat, and savory flavors that bring comfort in every bite.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-bold text-yellow-500">₱ 80.00</span>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-1000 ${isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '200ms' }}>
              <div className="h-40 sm:h-48 bg-yellow-500 flex items-center justify-center">
                <img
                  src={food2Image}
                  alt="Bicol Express"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Bicol Express</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  A rich and spicy coconut milk stew with tender pork, chilies, and shrimp paste, inspired by the bold flavors of Bicol.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-bold text-yellow-500">₱ 120.00</span>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-1000 sm:col-span-2 lg:col-span-1 ${isVisible.products ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '400ms' }}>
              <div className="h-40 sm:h-48 bg-yellow-500 flex items-center justify-center">
                <img
                  src={food3Image}
                  alt="Pork Adobo"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Pork Adobo</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Philippines' signature dish of tender meat simmered in soy sauce, vinegar, garlic, and spices for a savory-sweet taste.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-bold text-yellow-500">₱ 100.00</span>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="bg-gray-50 py-16 sm:py-24 md:py-32 lg:py-35 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible.whatsCooking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          data-section="whatsCooking"
        >
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              What's <span className="text-yellow-500">Cooking</span>
            </h2>
          </div>

          {/* Layout Grid - Mobile: Single column, Desktop: Complex grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto md:grid-rows-2">
            {/* Large Card 1 - Kare-Kare */}
            <div className="md:col-span-2 md:row-span-1 bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative h-64 sm:h-80 md:h-[290px]">
              <div className="h-full bg-gradient-to-br from-amber-400 to-orange-600 relative overflow-hidden">
                <img
                  src={kareImage}
                  alt="Kare-Kare"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                  <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    Kare-Kare
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-1">Chef Elena's Traditional</p>
                  <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
                    A rich and creamy peanut-based stew with tender oxtail, beef tripe, and fresh vegetables.
                    Served with bagoong (shrimp paste) for that authentic Filipino flavor.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Card 1 - Lechon */}
            <div className="md:col-span-1 md:row-span-2 bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative h-64 sm:h-80 md:h-[600px]">
              <div className="h-full bg-gradient-to-br from-orange-400 to-red-600 relative overflow-hidden">
                <img
                  src={lechonImage}
                  alt="Lechon"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-1">
                    Lechon Kawali
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-1">Chef Carlos's Specialty</p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Perfectly roasted whole pig with crispy skin and succulent meat. A Filipino celebration favorite.
                  </p>
                </div>
              </div>
            </div>

            {/* Small Card 2 - Pancit */}
            <div className="md:col-span-1 md:row-span-1 bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative h-64 sm:h-80 md:h-[290px]">
              <div className="h-full bg-gradient-to-br from-green-400 to-emerald-600 relative overflow-hidden">
                <img
                  src={pancitImage}
                  alt="Pancit"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6">
                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-1">
                    Pancit Canton
                  </h3>
                  <p className="text-white/90 text-xs mb-1">Chef Maria's Special</p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Stir-fried wheat noodles with mixed vegetables, shrimp, and your choice of meat.
                  </p>
                </div>
              </div>
            </div>

            {/* Large Card 2 - Adobo */}
            <div className="md:col-span-1 md:row-span-1 bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer relative h-64 sm:h-80 md:h-[290px]">
              <div className="h-full bg-gradient-to-br from-purple-400 to-indigo-600 relative overflow-hidden">
                <img
                  src={adoboImage}
                  alt="Adobo"
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6 md:p-8">
                  <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    Chicken Adobo
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-1">Chef Juan's Classic</p>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
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
      <div className="bg-white py-20 sm:py-32 md:py-40 lg:py-50 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible.readyToStart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          data-section="readyToStart"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-4">
            Ready to get <span className="text-yellow-500">Started?</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Join Lamoy today and enjoy quick, easy access to your favorite
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            Filipino meals—anytime, anywhere.
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-yellow-500 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {/* Logo and Description */}
            <div className="md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4 sm:mb-6">
                <img
                  src={logoImage}
                  alt="Lamoy Logo"
                  className="w-20 h-20 sm:w-40 sm:h-40 mr-2 sm:mr-3"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">About</a></li>
                <li><a href="https://mail.google.com/mail/?view=cm&fs=1&to=cyrilypil@gmail.com&su=Customer%20Support%20&body=Enter%20your%20concern%20here" target="_blank" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Contact</a></li>
              </ul>
            </div>

            {/* Our Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Our Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Terms</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Privacy</a></li>
                <li><a href="https://mail.google.com/mail/?view=cm&fs=1&to=cyrilypil@gmail.com&su=Customer%20Support%20&body=Enter%20your%20concern%20here" target="_blank" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Support</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li className="text-white/80 text-sm sm:text-base">cyrilypil@gmail.com</li>
                <li className="text-white/80 text-sm sm:text-base">+63 931 010 8119</li>
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

export default Landing;