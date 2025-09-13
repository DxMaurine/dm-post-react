import React from "react";
import { useEffect, useState } from "react";
import { ThemeProviderContext } from "./theme-context";

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "enabled") {
      return true;
    } else if (savedDarkMode === "disabled") {
      return false;
    } else {
      // Default to system preference if no saved setting
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  const [themeVariant, setThemeVariant] = useState(() => 
    localStorage.getItem("theme_variant") || "theme-forest"
  );

  useEffect(() => {
    const htmlElement = document.documentElement;
    const themeClasses = ['theme-midnight', 'theme-forest', 'theme-blue-ocean']; // Add all your theme variant classes here

    // Apply dark/light mode class
    if (isDarkMode) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
      localStorage.setItem('darkMode', 'disabled');
    }

    // Apply theme variant class
    htmlElement.classList.remove(...themeClasses);
    if (themeVariant !== 'default') {
      htmlElement.classList.add(themeVariant);
    }
    localStorage.setItem('theme_variant', themeVariant);

  }, [isDarkMode, themeVariant]);

  const value = {
    isDarkMode,
    setIsDarkMode,
    themeVariant,
    setThemeVariant,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}