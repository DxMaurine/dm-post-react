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
    w-6 h-6 transform rounded-full transition-all duration-300 
    flex items-center justify-center shadow-lg
    ${isDarkMode ? 'bg-yellow-500' : 'bg-white'}
    ${isCollapsed ? 'translate-x-1' : isDarkMode ? 'translate-x-7' : 'translate-x-1'}
  `;

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center h-8 w-14 rounded-full mx-auto sm:mx-0
        ${isDarkMode 
          ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-700/30' 
          : 'bg-gradient-to-b from-blue-300 to-blue-400 border-blue-500/20'
        }
        shadow-lg border
        transition-colors duration-300
        focus:outline-none focus:ring-2 focus:ring-blue-500
        dark:focus:ring-offset-gray-800
      `}
      aria-label={isCollapsed ? 'Toggle theme' : 'Toggle dark mode'}
    >
      {/* Track shadow for depth */}
      <span className={`absolute inset-0 rounded-full shadow-inner ${isDarkMode ? 'bg-black/10' : 'bg-black/5'}`}></span>
      
      <span className={thumbClasses}>
        {isDarkMode ? (
          <div className="relative">
            <FiMoon 
              className="text-yellow-100" 
              size={20} 
              style={{
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
              }}
            />
            <FiMoon 
              className="text-white absolute inset-0" 
              size={20} 
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
              }}
            />
          </div>
        ) : (
          <div className="relative">
            <FiSun 
              className="text-blue-600" 
              size={16} 
              style={{
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
              }}
            />
            <FiSun 
              className="text-blue-400 absolute inset-0" 
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