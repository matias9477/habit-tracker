import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';

/**
 * Get theme colors based on the current theme mode.
 * Supports light and dark themes with comprehensive color palette.
 */
export const getThemeColors = (isDarkMode: boolean) => {
  if (isDarkMode) {
    return {
      // Background colors
      background: '#121212',
      surface: '#1E1E1E',
      surfaceVariant: '#2D2D2D',

      // Text colors
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textTertiary: '#808080',

      // Primary colors
      primary: '#4CAF50',
      primaryLight: '#66BB6A',
      primaryDark: '#388E3C',

      // Status colors
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',

      // UI colors
      border: '#333333',
      divider: '#404040',
      shadow: '#000000',

      // Switch colors
      switchTrack: '#404040',
      switchThumb: '#FFFFFF',
      switchThumbDisabled: '#666666',

      // Loading color
      loading: '#4CAF50',
    };
  } else {
    return {
      // Background colors
      background: '#F5F5F5',
      surface: '#FFFFFF',
      surfaceVariant: '#F8F8F8',

      // Text colors
      text: '#333333',
      textSecondary: '#666666',
      textTertiary: '#999999',

      // Primary colors
      primary: '#4CAF50',
      primaryLight: '#E8F5E8',
      primaryDark: '#388E3C',

      // Status colors
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',

      // UI colors
      border: '#E0E0E0',
      divider: '#F0F0F0',
      shadow: '#000000',

      // Switch colors
      switchTrack: '#E0E0E0',
      switchThumb: '#FFFFFF',
      switchThumbDisabled: '#CCCCCC',

      // Loading color
      loading: '#4CAF50',
    };
  }
};

/**
 * Hook to get the current theme mode and determine if dark mode should be used.
 * Takes into account the user's preference and system setting.
 */
export const useTheme = () => {
  const { themeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Determine if dark mode should be used
  const isDarkMode =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  return {
    themeMode,
    isDarkMode,
    systemColorScheme,
  };
};
