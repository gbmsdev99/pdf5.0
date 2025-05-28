import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck, BarChart, Book, HelpCircle } from 'lucide-react';

export function NavBar() {
  const location = useLocation();
  
  // Don't show navbar during test
  if (location.pathname === '/test') {
    return null;
  }
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ClipboardCheck className="h-8 w-8 text-indigo-900" />
            <span className="text-xl font-bold text-indigo-900">PDF Test Maker</span>
          </Link>
          
          <nav className="flex space-x-4">
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
      </div>
    </header>
  );
}