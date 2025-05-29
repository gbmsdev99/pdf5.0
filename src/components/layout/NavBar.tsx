import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck, BarChart, Book, HelpCircle, Menu, X } from 'lucide-react';

export function NavBar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Don't show navbar during test
  if (location.pathname === '/test') {
    return null;
  }
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-900" />
            <span className="text-lg sm:text-xl font-bold text-indigo-900">PDF Test Maker</span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/results"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === '/results' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart className="h-4 w-4 mr-1" />
              Results
            </Link>
            <Link
              to="/manual"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === '/manual' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Book className="h-4 w-4 mr-1" />
              Manual
            </Link>
            <Link
              to="/faq"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                location.pathname === '/faq' 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              FAQ
            </Link>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/' 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/results"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/results' 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Results
                </div>
              </Link>
              <Link
                to="/manual"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/manual' 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Manual
                </div>
              </Link>
              <Link
                to="/faq"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/faq' 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  FAQ
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}