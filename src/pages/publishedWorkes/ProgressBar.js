// ProgressBar.jsx
import React from 'react';

export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
