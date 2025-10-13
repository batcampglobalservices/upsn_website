import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/img/logo-ups.png';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full font-[monospace] transition-all duration-500 ${
        isScrolled
          ? 'bg-gray-900/80 backdrop-blur-md shadow-lg text-white'
          : 'bg-transparent text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center pt-2">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-full" />
            <a href="/" className="ml-2 font-bold text-md text-white">
              University Of Nigeria Primary School, <br /> Nsukka
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {['Home', 'About', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-gray-800/60 dark:hover:bg-gray-800/60 transition"
                >
                  {item}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-500 dark:hover:bg-blue-500 transition shadow-lg hover:shadow-blue-500/50"
              >
                Portal
              </Link>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-800/60 dark:bg-gray-800/60 hover:bg-gray-700/80 dark:hover:bg-gray-700/80 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="focus:outline-none text-gray-300 hover:text-white"
              onClick={toggleMenu}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-gray-900/90 backdrop-blur-md`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <a
              key={item}
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800/60 hover:text-white"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
