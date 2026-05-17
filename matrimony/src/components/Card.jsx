import React from 'react';

export default function Card({ children, className }) {
  return (
    <div className={`bg-white dark:bg-[#211d1a] border border-gray-100 dark:border-[#393536] rounded-lg p-5 shadow-card dark:shadow-none ${className || ''}`}>
      {children}
    </div>
  );
}