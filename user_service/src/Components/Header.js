// src/Components/Header.js
import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">FixFinder</div>

        {/* Hamburger icon */}
        <div className="lg:hidden" onClick={toggleMenu}>
          <button className="text-2xl">&#9776;</button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex space-x-4">
          <a href="#home" className="hover:text-gray-300">Home</a>
          <a href="#services" className="hover:text-gray-300">Services</a>
          <a href="#contact" className="hover:text-gray-300">Contact</a>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="lg:hidden mt-4 space-y-2">
          <a href="#home" className="block text-white">Home</a>
          <a href="#services" className="block text-white">Services</a>
          <a href="#contact" className="block text-white">Contact</a>
        </div>
      )}
    </header>
  );
};

export default Header;
