// CustomButton.jsx
import React from 'react';

export default function CustomButton({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition ${className}`}
    >
      {children}
    </button>
  );
}
