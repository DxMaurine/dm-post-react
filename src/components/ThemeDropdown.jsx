import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/use-theme';
import { FiSun, FiMoon, FiMonitor, FiChevronDown } from 'react-icons/fi';

const themes = [
  { name: 'Light', value: 'light', icon: FiSun },
  { name: 'Dark Azure', value: 'dark', variant: 'default', icon: FiMonitor },
  { name: 'Olive', value: 'dark', variant: 'theme-midnight', icon: FiMoon },
  { name: 'Fusion', value: 'dark', variant: 'theme-forest', icon: FiMoon },
];

const ThemeDropdown = ({ isCollapsed }) => {
  const { isDarkMode, setIsDarkMode, themeVariant, setThemeVariant } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentThemeName = () => {
    if (!isDarkMode) return 'Light';
    if (themeVariant === 'theme-midnight') return 'Olive';
    if (themeVariant === 'theme-forest') return 'Fusion';
    return 'Dark Azure';
  };

  const handleThemeChange = (theme) => {
    if (theme.value === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
      setThemeVariant(theme.variant);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="p-3 border-t border-[var(--border-default)]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500/50 transition-colors"
        >
          <div className="flex items-center">
            {isDarkMode ? <FiMoon className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : <FiSun className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            {!isCollapsed && <span className="ml-3 font-medium text-sm text-gray-600 dark:text-gray-300">{currentThemeName()}</span>}
          </div>
          {!isCollapsed && <FiChevronDown className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </button>
      </div>

      {isOpen && !isCollapsed && (
        <div className="absolute bottom-full mb-2 w-[calc(100%-1.5rem)] left-3 bg-white dark:bg-[var(--layout-bg-dark)] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <ul>
            {themes.map((theme) => (
              <li key={theme.name}>
                <button
                  onClick={() => handleThemeChange(theme)}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500/50"
                >
                  <theme.icon className="h-4 w-4 mr-3" />
                  {theme.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;