import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const getPreferred = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || getPreferred());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-[#3a3634] bg-white dark:bg-[#1f1b18] text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-[#2b2725]"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <span className="text-amber-wedding">☀️</span>
          <span className="text-xs tracking-wide uppercase">Light Mode</span>
        </>
      ) : (
        <>
          <span className="text-primary">🌙</span>
          <span className="text-xs tracking-wide uppercase text-gray-600">Dark Mode</span>
        </>
      )}
    </button>
  );
}