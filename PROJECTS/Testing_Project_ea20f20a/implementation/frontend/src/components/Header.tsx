import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Info, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} className="mr-2" /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={18} className="mr-2" /> },
    { name: 'About', path: '/about', icon: <Info size={18} className="mr-2" /> },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-primaryDark flex items-center gap-2">
          <span className="bg-primary text-primaryDark px-2 py-1 rounded-lg">NEON</span>
          DO
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-semibold">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center transition-colors hover:text-primaryDark relative group ${location.pathname === link.path ? 'text-primaryDark' : 'text-textMuted'}`}
            >
              {link.icon}
              {link.name}
              {location.pathname === link.path && (
                <motion.div layoutId="underline" className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full shadow-neon" />
              )}
            </Link>
          ))}
          <Link to="/tasks" className="btn-neon ml-4">
            Get Started
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primaryDark" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.nav 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full glass-panel shadow-xl flex flex-col p-6 gap-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-lg font-bold text-primaryDark p-3 rounded-xl hover:bg-mintCream"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </motion.nav>
      )}
    </header>
  );
};

export default Header;