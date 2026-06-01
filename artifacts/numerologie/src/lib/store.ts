import type { ThemeNumerologique } from '@workspace/api-client-react';

let currentTheme: ThemeNumerologique | null = null;

export const setTheme = (theme: ThemeNumerologique) => {
  currentTheme = theme;
  try {
    sessionStorage.setItem('numerologie_theme', JSON.stringify(theme));
  } catch (err) {
    // Ignore storage errors
  }
};

export const getTheme = (): ThemeNumerologique | null => {
  if (currentTheme) return currentTheme;
  try {
    const stored = sessionStorage.getItem('numerologie_theme');
    if (stored) {
      currentTheme = JSON.parse(stored);
      return currentTheme;
    }
  } catch (err) {
    // Ignore parse errors
  }
  return null;
};
