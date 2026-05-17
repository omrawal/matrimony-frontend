import React from 'react';
import clsx from 'clsx';

export default function Button({ children, className, variant = 'primary', ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-600',
        variant === 'ghost' && 'bg-transparent border border-gray-200 dark:border-[#3a3634]',
        className
      )}
    >
      {children}
    </button>
  );
}