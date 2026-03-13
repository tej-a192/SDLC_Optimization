import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Header component for the application
 * Displays the main navigation and branding
 */
const Header = () => {
  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="logo">
          TaskFlow
        </Link>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/tasks">Tasks</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;