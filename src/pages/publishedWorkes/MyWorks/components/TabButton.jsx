import React from 'react';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-100 text-blue-600' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

export default TabButton;

