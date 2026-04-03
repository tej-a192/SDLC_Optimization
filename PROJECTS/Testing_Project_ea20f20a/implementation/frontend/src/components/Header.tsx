import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Header component for the application navigation
 * Provides navigation links to different sections of the app
 */
const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">To-Do App</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/" 
                className="hover:text-blue-200 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="hover:text-blue-200 transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;