import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Link, useLocation } from 'react-router-dom'; // Add useLocation here

export default function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin'); // Check if it's an admin page

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#171412] text-gray-800 dark:text-gray-100">
      <header className="py-4 border-b border-gray-200 dark:border-[#2b2725]">
        <div className="container flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo - Dynamically routes to correct home */}
          <Link to={isAdminRoute ? "/admin" : "/dashboard"} className="text-xl font-semibold text-primary">
            Matrimony
          </Link>

          {/* Navigation - Conditionally rendered based on admin status */}
          <nav className="flex flex-1 sm:flex-none order-last sm:order-none justify-center sm:justify-start gap-6 text-sm text-gray-600 dark:text-gray-300 font-medium">
            {isAdminRoute ? (
              <>
                <Link to="/admin" className="hover:text-primary transition-colors">Verifications</Link>
                <Link to="/admin/users" className="hover:text-primary transition-colors">Manage Users</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link>
                <Link to="/shortlist" className="hover:text-primary transition-colors">Shortlist</Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user_id'); window.location.href = '/login'; }}
              className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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