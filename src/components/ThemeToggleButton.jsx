// src/components/ThemeToggleButton.jsx
import { useTheme } from '../hooks/use-theme';
import { FiSun, FiMoon } from 'react-icons/fi';
import PropTypes from 'prop-types';

export function ThemeToggleButton({ isCollapsed = false }) {
  const { isDarkMode, setIsDarkMode } = useTheme();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const thumbClasses = `
    w-6 h-6 transform bg-white rounded-full transition-all duration-300 
    flex items-center justify-center shadow-lg
    ${isCollapsed ? 'translate-x-1' : isDarkMode ? 'translate-x-7' : 'translate-x-1'}
  `;

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center h-8 w-14 rounded-full mx-auto sm:mx-0
        bg-gradient-to-b from-gray-300 to-gray-400 dark:from-yellow-400 dark:to-yellow-600 
        shadow-lg border border-gray-500/20 dark:border-yellow-700/30
        transition-colors duration-300
        focus:outline-none focus:ring-2 focus:ring-blue-500
        dark:focus:ring-offset-gray-800
      `}
      aria-label={isCollapsed ? 'Toggle theme' : 'Toggle dark mode'}
    >
      {/* Track shadow for depth */}
      <span className="absolute inset-0 rounded-full shadow-inner bg-black/5"></span>
      
      <span className={thumbClasses}>
        {isDarkMode ? (
          <div className="relative">
            <FiMoon 
              className="text-gray-700" 
              size={20} 
              style={{
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
              }}
            />
            <FiMoon 
              className="text-indigo-300 absolute inset-0" 
              size={20} 
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
              }}
            />
          </div>
        ) : (
          <div className="relative">
            <FiSun 
              className="text-yellow-600" 
              size={16} 
              style={{
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
              }}
            />
            <FiSun 
              className="text-yellow-300 absolute inset-0" 
              size={16} 
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
              }}
            />
          </div>
        )}
      </span>
    </button>
  );
}

ThemeToggleButton.propTypes = {
  isCollapsed: PropTypes.bool
};