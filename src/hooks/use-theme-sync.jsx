// src/hooks/use-theme-sync.jsx
import { useEffect, useState } from 'react';

export function useThemeSync() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsTransitioning(true);
      
      // Apply smooth transition to specific containers
      const containers = document.querySelectorAll('.theme-sync-container, .customer-display-container');
      containers.forEach(container => {
        if (container) {
          container.style.transition = 'all 0.3s ease-in-out';
          container.style.opacity = '0.95';
          container.style.transform = 'scale(0.999)';
          container.style.filter = 'brightness(0.95)';
        }
      });
      
      setTimeout(() => {
        containers.forEach(container => {
          if (container) {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
            container.style.filter = 'brightness(1)';
          }
        });
        setIsTransitioning(false);
      }, 150);
    };

    // Listen for theme changes from IPC (Electron)
    if (window.electron?.onThemeChange) {
      window.electron.onThemeChange(handleThemeChange);
    }
    
    // Listen for localStorage theme changes (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'theme-change' || e.key === 'darkMode' || e.key === 'theme_variant') {
        handleThemeChange();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (window.electron?.removeThemeListener) {
        window.electron.removeThemeListener(handleThemeChange);
      }
    };
  }, []);

  return { isTransitioning };
}