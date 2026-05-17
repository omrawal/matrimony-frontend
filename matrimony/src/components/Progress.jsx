import React from 'react';

export default function Progress({ value = 0 }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-[#2b2725] rounded-full h-3 overflow-hidden">
      <div className="h-3 bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}