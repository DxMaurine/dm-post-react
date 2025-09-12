import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/use-theme';
import { FiSun, FiMoon, FiMonitor, FiChevronDown } from 'react-icons/fi';

const themes = [
  { name: 'Light', value: 'light', icon: FiSun },
  { name: 'Dark Azure', value: 'dark', variant: 'default', icon: FiMonitor },
  { name: 'Olive', value: 'dark', variant: 'theme-midnight', icon: FiMoon },
  { name: 'Fusion', value: 'dark', variant: 'theme-forest', icon: FiMoon },
  { name: 'Blue Ocean', value: 'dark', variant: 'theme-blue-ocean', icon: FiSun },
];

const ThemeDropdown = ({ isCollapsed }) => {
  const { isDarkMode, setIsDarkMode, themeVariant, setThemeVariant } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentThemeName = () => {
    if (!isDarkMode) return 'Light';
    if (themeVariant === 'theme-midnight') return 'Olive';
    if (themeVariant === 'theme-forest') return 'Fusion';
    if (themeVariant === 'theme-blue-ocean') return 'Blue Ocean';
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
          className={`w-full flex items-center p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-500/50 transition-all duration-300 neumorphic-btn ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          <div className="flex items-center">
            {isDarkMode ? 
              <FiMoon className="h-5 w-5 text-slate-500 dark:text-yellow-300 fill-slate-400 dark:fill-yellow-700" /> : 
              <FiSun className="h-5 w-5 text-yellow-500 dark:text-yellow-400 fill-yellow-400 dark:fill-yellow-500" />
            }
            {!isCollapsed && <span className="ml-3 font-medium text-sm text-gray-600 dark:text-gray-300">{currentThemeName()}</span>}
          </div>
          {!isCollapsed && <FiChevronDown className={`h-5 w-5 text-gray-900 dark:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </button>
      </div>

      {isOpen && !isCollapsed && (
        <div className="absolute bottom-full mb-2 w-[calc(100%-1.5rem)] left-3 bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-10 neumorphic-dropdown transform transition-all duration-300 scale-100 opacity-100">
          <ul>
            {themes.map((theme) => (
              <li key={theme.name}>
                <button
                  onClick={() => handleThemeChange(theme)}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500/50 transition-all duration-200 rounded-lg"
                >
                  <theme.icon className="h-4 w-4 mr-3" />
                  {theme.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <style jsx>{`
        .neumorphic-btn {
          background: var(--bg-color, #e6e9ef);
          box-shadow: 5px 5px 10px var(--shadow-dark, #c9ccd1), 
                      -5px -5px 10px var(--shadow-light, #ffffff);
          border: none;
          transition: all 0.3s ease;
        }
        
        .neumorphic-btn:hover {
          box-shadow: 3px 3px 6px var(--shadow-dark, #c9ccd1), 
                      -3px -3px 6px var(--shadow-light, #ffffff);
          transform: translateY(-1px);
        }
        
        .neumorphic-btn:active {
          box-shadow: inset 3px 3px 6px var(--shadow-dark, #c9ccd1), 
                      inset -3px -3px 6px var(--shadow-light, #ffffff);
          transform: translateY(1px);
        }
        
        .neumorphic-dropdown {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.5);
          transform-origin: bottom center;
          animation: dropdownAppear 0.3s ease forwards;
        }
        
        .dark .neumorphic-btn {
          --bg-color: #252526;
          --shadow-dark:rgb(20, 21, 22);
          --shadow-light:rgb(63, 64, 65);
        }
        
        .dark.theme-midnight .neumorphic-btn {
          --bg-color: #3A4A3C;
          --shadow-dark: #2D3A2E;
          --shadow-light: #4A5F4C;
        }
        
        .dark.theme-forest .neumorphic-btn {
          --bg-color: #282C34;
          --shadow-dark: #1A1D21;
          --shadow-light: #40454F;
        }
        
        .dark.theme-blue-ocean .neumorphic-btn {
          --bg-color: #01e0e0;
          --shadow-dark:rgb(0, 130, 170);
          --shadow-light:rgb(3, 164, 185);
        }
        
        .dark .neumorphic-dropdown {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        @keyframes dropdownAppear {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeDropdown;