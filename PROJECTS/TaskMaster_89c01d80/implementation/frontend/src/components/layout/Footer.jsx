import React from 'react';

/**
 * Footer component for the application
 * Displays copyright information and navigation links
 */
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="/about" className="text-gray-300 hover:text-white transition-colors duration-200">
              About
            </a>
            <a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
              Contact
            </a>
            <a href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;