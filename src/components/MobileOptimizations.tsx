
import React, { useEffect } from 'react';

export const MobileOptimizations: React.FC = () => {
  useEffect(() => {
    // Prevent zoom on input focus (iOS Safari)
    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]');
      if (el !== null) {
        let content = el.getAttribute('content');
        let re = /maximum\-scale=[0-9\.]+/g;
        
        if (re.test(content as string)) {
          content = (content as string).replace(re, 'maximum-scale=1.0');
        } else {
          content = [content, 'maximum-scale=1.0'].join(', ');
        }
        
        el.setAttribute('content', content as string);
      }
    };

    // Apply mobile optimizations
    addMaximumScaleToMetaViewport();

    // Handle orientation change
    const handleOrientationChange = () => {
      // Small delay to ensure proper rendering after orientation change
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return null;
};
