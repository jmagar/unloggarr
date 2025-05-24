import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Theme } from '../../../types';

interface ScrollToTopProps {
  theme: Theme;
}

/**
 * Scroll to top button that appears when user scrolls down
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        theme === 'dark'
          ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
      } backdrop-blur-sm`}
      title="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}; 