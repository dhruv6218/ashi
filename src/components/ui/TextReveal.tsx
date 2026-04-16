import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = '', delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.2);
  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-2 -mb-2">
          <span
            className={`inline-block transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'
            }`}
            style={{ transitionDelay: `${delay + i * 40}ms` }}
          >
            {word}&nbsp;
          </span>
        </span>
      ))}
    </span>
  );
};
