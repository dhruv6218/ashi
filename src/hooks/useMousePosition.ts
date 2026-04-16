import { useEffect } from 'react';

export function useMousePosition() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Update CSS variables globally for dynamic lighting effects
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
}
