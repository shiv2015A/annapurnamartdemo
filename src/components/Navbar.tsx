import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings, Search, Menu, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full">
      {/* Main Navbar */}
      <div className="bg-slate-900 text-white flex items-center px-4 py-2 space-x-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center border border-transparent hover:border-white p-1 rounded">
          <span className="text-2xl font-bold tracking-tight">Annapurna<span className="text-amber-400">Mart</span></span>
        </Link>

        {/* Deliver to */}
        <div className="hidden md:flex items-center border border-transparent hover:border-white p-1 rounded cursor-pointer">
          <MapPin className="w-5 h-5 mt-2 text-gray-300" />
          <div className="ml-1 flex flex-col">
            <span className="text-xs text-gray-300 leading-3">Deliver to</span>
            <span className="text-sm font-bold leading-4">Select location</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-grow hidden sm:flex items-center bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-amber-400">
          <select className="bg-gray-100 text-gray-700 text-xs px-2 py-3 border-r border-gray-300 outline-none cursor-pointer hover:bg-gray-200">
            <option>All</option>
            <option>Groceries</option>
            <option>Electronics</option>
          </select>
          <input 
            type="text" 
            placeholder="Search AnnapurnaMart"
            className="flex-grow px-3 py-2 text-black outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-amber-400 hover:bg-amber-500 px-4 py-2 text-slate-900 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right side links */}
        <div className="flex items-center space-x-2">
          {role === 'admin' && (
            <Link to="/admin" className="flex flex-col border border-transparent hover:border-white p-1 rounded">
              <span className="text-xs text-gray-300 leading-3">Seller</span>
              <span className="text-sm font-bold leading-4 flex items-center">Dashboard <Settings className="w-4 h-4 ml-1" /></span>
            </Link>
          )}

          {user ? (
            <div className="flex flex-col border border-transparent hover:border-white p-1 rounded cursor-pointer group relative">
              <span className="text-xs text-gray-300 leading-3">Hello, {user.displayName?.split(' ')[0] || 'User'}</span>
              <span className="text-sm font-bold leading-4 flex items-center">Account & Lists</span>
              <div className="absolute top-full right-0 mt-1 w-48 bg-white text-black rounded shadow-lg hidden group-hover:block z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-bold">Your Account</p>
                </div>
                <Link to="/profile" className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2" /> Profile & Orders
                </Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex flex-col border border-transparent hover:border-white p-1 rounded">
              <span className="text-xs text-gray-300 leading-3">Hello, sign in</span>
              <span className="text-sm font-bold leading-4">Account & Lists</span>
            </Link>
          )}

          <Link to="/cart" className="flex items-center border border-transparent hover:border-white p-1 rounded relative">
            <div className="relative flex items-center">
              <ShoppingCart className="w-8 h-8" />
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 text-amber-400 font-bold text-sm">{totalItems}</span>
            </div>
            <span className="text-sm font-bold mt-3 hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Secondary Navbar */}
      <div className="bg-slate-800 text-white px-4 py-1 flex items-center space-x-4 text-sm">
        <button className="flex items-center font-bold border border-transparent hover:border-white p-1 rounded">
          <Menu className="w-5 h-5 mr-1" /> All
        </button>
        <a href="#" className="border border-transparent hover:border-white p-1 rounded hidden sm:inline">Fresh Produce</a>
        <a href="#" className="border border-transparent hover:border-white p-1 rounded hidden sm:inline">Dairy & Eggs</a>
        <a href="#" className="border border-transparent hover:border-white p-1 rounded hidden md:inline">Bakery</a>
        <a href="#" className="border border-transparent hover:border-white p-1 rounded hidden md:inline">Beverages</a>
        <a href="#" className="border border-transparent hover:border-white p-1 rounded hidden lg:inline">Snacks</a>
      </div>
    </header>
  );
}
