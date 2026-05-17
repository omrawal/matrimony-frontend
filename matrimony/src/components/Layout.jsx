import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#171412] text-gray-800 dark:text-gray-100">
      <header className="py-4 border-b border-gray-200 dark:border-[#2b2725]">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-semibold">Suhāg • Matrimony</Link>
            <nav className="hidden md:flex gap-4 text-sm text-gray-600 dark:text-gray-300">
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <Link to="/profile" className="hover:underline">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user_id'); window.location.href = '/login'; }}
              className="hidden md:inline-block px-3 py-2 rounded-sm text-sm border border-gray-200 dark:border-[#3a3634]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}