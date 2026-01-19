import React, { useEffect, useRef } from 'react';
import './CardAnimations.css';

interface CardAnimationsProps {
  children: React.ReactNode;
  delay?: number;
  variant?: 'fade' | 'slide' | 'scale';
}

export const AnimatedCard: React.FC<CardAnimationsProps> = ({
  children,
  delay = 0,
  variant = 'fade',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`animated-card animated-card-${variant}`}
      style={{ '--animation-delay': `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
