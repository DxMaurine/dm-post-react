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
      <div className="grid grid-cols-3 gap-2">
        {themes.map(theme => (
          <button 
            key={theme.value}
            onClick={() => setThemeVariant(theme.value)}
            className={`text-xs py-2 rounded-md transition-colors ${
              themeVariant === theme.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeVariantSwitcher;
