import { createContext } from "react";
import React from 'react';

// Nilai default ini akan digunakan jika suatu komponen mencoba menggunakan context
// di luar dari provider-nya. Ini juga bagus untuk auto-completion di IDE.
const defaultProviderValue = {
  theme: "light",
  setTheme: () => console.warn('setTheme function called outside of a ThemeProvider'),
  themeVariant: "theme-midnight",
  setThemeVariant: () => console.warn('setThemeVariant function called outside of a ThemeProvider'),
};

export const ThemeProviderContext = createContext(defaultProviderValue);
