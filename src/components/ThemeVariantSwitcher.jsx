import React from 'react';
import { useTheme } from '../hooks/use-theme';

const ThemeVariantSwitcher = ({ isCollapsed }) => {
  const { themeVariant, setThemeVariant } = useTheme();

  if (isCollapsed) {
    return null;
  }

  const themes = [
    { name: 'Default', value: 'default' },
    { name: 'Midnight', value: 'theme-midnight' },
    { name: 'Forest', value: 'theme-forest' },
  ];

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3 tracking-wider">
        Gaya Tema Gelap
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(theme => (
          <button 
            key={theme.value}
            onClick={() => setThemeVariant(theme.value)}
            className={`text-xs py-2 rounded-xl transition-all duration-300 transform ${
              themeVariant === theme.value 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'neumorphic-btn text-gray-700 dark:text-gray-200 active:scale-95'
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>
      
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
        }
        
        .neumorphic-btn:active {
          box-shadow: inset 3px 3px 6px var(--shadow-dark, #c9ccd1), 
                      inset -3px -3px 6px var(--shadow-light, #ffffff);
        }
        
        .dark .neumorphic-btn {
          --bg-color: #2d3748;
          --shadow-dark: #222731;
          --shadow-light: #384152;
        }
      `}</style>
    </div>
  );
};

export default ThemeVariantSwitcher;