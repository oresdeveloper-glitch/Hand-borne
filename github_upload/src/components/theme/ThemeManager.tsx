import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

/**
 * ThemeManager - Handles dark/light mode application to document
 * Must be mounted once at app root to sync store state with DOM
 */
const ThemeManager: React.FC = () => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const setDarkMode = useAppStore((state) => state.setDarkMode);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem('hba-storage');
      const storedState = stored ? JSON.parse(stored) : null;
      if (!storedState?.state?.isDarkMode && storedState?.state?.isDarkMode !== false) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  // Apply dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme', 'light');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#0f172a' : '#2563eb');
    }
  }, [isDarkMode]);

  return null;
};

export default ThemeManager;
