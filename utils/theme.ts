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
  // Additional colors for consistent theming
  switchTrack: string;
  switchThumb: string;
  switchThumbDisabled: string;
  loading: string;
  danger: string;
  dangerLight: string;
  warningLight: string;
  successLight: string;
  overlay: string;
  disabled: string;
  disabledText: string;
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
  // Additional colors
  switchTrack: '#e0e0e0',
  switchThumb: '#ffffff',
  switchThumbDisabled: '#f4f3f4',
  loading: '#4CAF50',
  danger: '#f44336',
  dangerLight: '#ffebee',
  warningLight: '#fff3e0',
  successLight: '#e8f5e8',
  overlay: '#f0f0f0',
  disabled: '#cccccc',
  disabledText: '#999999',
};

export const darkTheme: ThemeColors = {
  primary: '#4CAF50',
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
  // Additional colors
  switchTrack: '#333333',
  switchThumb: '#ffffff',
  switchThumbDisabled: '#666666',
  loading: '#4CAF50',
  danger: '#f44336',
  dangerLight: '#3d1f1f',
  warningLight: '#3d2f1f',
  successLight: '#1f3d1f',
  overlay: '#1a1a1a',
  disabled: '#666666',
  disabledText: '#444444',
};

/**
 * Get the appropriate theme colors based on dark mode setting.
 * @param isDarkMode - Whether dark mode is enabled
 * @returns ThemeColors object for the current theme
 */
export const getThemeColors = (isDarkMode: boolean): ThemeColors => {
  return isDarkMode ? darkTheme : lightTheme;
};
