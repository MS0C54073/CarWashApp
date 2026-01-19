import React from 'react';
import './CarAnimation.css';

interface CarAnimationProps {
  variant?: 'driving' | 'washing' | 'parking';
  speed?: number;
  delay?: number;
  direction?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}

const CarAnimation: React.FC<CarAnimationProps> = ({
  variant = 'driving',
  speed = 20,
  delay = 0,
  direction = 'right',
  size = 'medium',
}) => {
  const carColors = [
    '#2563eb', // Blue
    '#dc2626', // Red
    '#059669', // Green
    '#d97706', // Orange
    '#7c3aed', // Purple
    '#0891b2', // Cyan
  ];

  const randomColor = carColors[Math.floor(Math.random() * carColors.length)];

  return (
    <div
      className={`car-animation car-${variant} car-${direction} car-${size}`}
      style={{
        '--animation-speed': `${speed}s`,
        '--animation-delay': `${delay}s`,
      } as React.CSSProperties}
    >
      <svg
        className="car-svg"
        viewBox="0 0 100 50"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Car Body */}
        <rect x="15" y="20" width="70" height="20" rx="3" fill={randomColor} />
        <rect x="20" y="12" width="60" height="15" rx="5" fill={randomColor} opacity="0.9" />
        
        {/* Windows */}
        <rect x="25" y="15" width="20" height="10" rx="2" fill="#87ceeb" opacity="0.6" />
        <rect x="55" y="15" width="20" height="10" rx="2" fill="#87ceeb" opacity="0.6" />
        
        {/* Wheels */}
        <circle cx="30" cy="40" r="6" fill="#1a1a1a" />
        <circle cx="30" cy="40" r="3" fill="#4a4a4a" />
        <circle cx="70" cy="40" r="6" fill="#1a1a1a" />
        <circle cx="70" cy="40" r="3" fill="#4a4a4a" />
        
        {/* Headlights */}
        {direction === 'right' && (
          <>
            <circle cx="85" cy="25" r="3" fill="#ffeb3b" />
            <circle cx="85" cy="35" r="3" fill="#ff9800" />
          </>
        )}
        {direction === 'left' && (
          <>
            <circle cx="15" cy="25" r="3" fill="#ffeb3b" />
            <circle cx="15" cy="35" r="3" fill="#ff9800" />
          </>
        )}
      </svg>
      
      {/* Washing effect overlay */}
      {variant === 'washing' && (
        <div className="washing-effect">
          <div className="water-droplet"></div>
          <div className="water-droplet"></div>
          <div className="water-droplet"></div>
        </div>
      )}
    </div>
  );
};

export default CarAnimation;
