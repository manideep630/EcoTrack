import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white/90 backdrop-blur-md border-b border-eco-mint/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-eco-forest" />
              <span className="text-xl font-bold text-eco-forest tracking-tight">EcoTrack</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-eco-forest font-medium hover:text-eco-leaf transition-colors">Log In</Link>
              <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-eco-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Leaf className="h-6 w-6 text-eco-mint" />
            <span className="text-xl font-bold">EcoTrack</span>
          </div>
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} EcoTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
