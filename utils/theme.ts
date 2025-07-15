export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  error: string;
  success: string;
  warning: string;
}

export const lightTheme: ThemeColors = {
  primary: '#4CAF50',
  primaryLight: '#81C784',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  shadow: '#000000',
  error: '#d32f2f',
  success: '#2e7d32',
  warning: '#ed6c02',
};

export const darkTheme: ThemeColors = {
  primary: '#81C784',
  primaryLight: '#A5D6A7',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  shadow: '#000000',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
};

/**
 * Get the appropriate theme colors based on dark mode setting.
 * @param isDarkMode - Whether dark mode is enabled
 * @returns ThemeColors object for the current theme
 */
export const getThemeColors = (isDarkMode: boolean): ThemeColors => {
  return isDarkMode ? darkTheme : lightTheme;
};
