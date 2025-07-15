import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../utils/theme';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Shared themed button component that automatically adapts to light/dark mode.
 * Supports primary and danger variants with consistent styling across the app.
 */
export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  ...props
}) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);

  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    if (variant === 'danger') {
      baseStyle.push({
        backgroundColor: isDarkMode ? '#8B0000' : '#f44336',
        borderColor: isDarkMode ? '#DC143C' : '#f44336',
      } as any);
    } else {
      baseStyle.push({
        backgroundColor: isDarkMode ? '#2E7D32' : colors.primary,
        borderColor: isDarkMode ? '#4CAF50' : colors.primary,
      } as any);
    }

    if (disabled) {
      baseStyle.push({
        backgroundColor: colors.border,
        borderColor: colors.border,
      } as any);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, { color: '#fff' }];

    if (disabled) {
      baseStyle.push({ color: colors.textSecondary });
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), { borderWidth: 1 }, style]}
      disabled={disabled || loading}
      {...props}
    >
      <Text style={getTextStyle()}>{loading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
