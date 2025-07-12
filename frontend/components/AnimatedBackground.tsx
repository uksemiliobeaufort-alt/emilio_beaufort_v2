import React from 'react';

// Sophisticated animated gradient background
const AnimatedBackground: React.FC = () => (
  <div
    className="fixed inset-0 -z-10 w-full h-full animate-gradient-move bg-gradient-to-br from-[#f5f3ea] via-[#e7dac7] to-[#b7a16c] opacity-90"
    style={{
      background: 'linear-gradient(120deg, #f5f3ea 0%, #e7dac7 50%, #b7a16c 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientMove 12s ease-in-out infinite',
    }}
  />
);

export default AnimatedBackground;

// Add the keyframes for the gradient animation
// You will need to add this to your global CSS (e.g., globals.css):
//
// @keyframes gradientMove {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// } 