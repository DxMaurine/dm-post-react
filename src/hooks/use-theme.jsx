import { useContext } from "react";
import { ThemeProviderContext } from "../context/theme-context";
import React from 'react';

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}