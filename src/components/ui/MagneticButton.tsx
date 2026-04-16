import React from 'react';
import { useMagnetic } from '../../hooks/useMagnetic';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = '', onClick, strength = 0.2 }) => {
  const magneticRef = useMagnetic(strength);
  return (
    <div 
      ref={magneticRef as React.RefObject<HTMLDivElement>} 
      className={`inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
