// CustomProgressBar.jsx
import React from 'react';

export default function CustomProgressBar({ value }) {
  const safeValue = Math.min(Math.max(value, 0), 100); // להבטיח שהערך בין 0 ל-100

  return (
    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-500 h-full transition-all duration-300"
        style={{ width: `${safeValue}%` }}
      ></div>
    </div>
  );
}
