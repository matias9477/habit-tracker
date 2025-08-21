import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
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
  console.log('[ThemedButton] Rendered:', {
    title,
    variant,
    disabled,
    loading,
  });

  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button];

    if (variant === 'danger') {
      baseStyle.push({
        backgroundColor: isDarkMode ? '#8B0000' : '#f44336',
        borderColor: isDarkMode ? '#DC143C' : '#f44336',
      });
    } else {
      baseStyle.push({
        backgroundColor: isDarkMode ? '#2E7D32' : colors.primary,
        borderColor: isDarkMode ? '#fcba03' : colors.primary,
      });
    }

    if (disabled) {
      baseStyle.push({
        backgroundColor: colors.border,
        borderColor: colors.border,
      });
    }

    return baseStyle as StyleProp<ViewStyle>;
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle[] = [styles.buttonText, { color: '#fff' }];

    if (disabled) {
      baseStyle.push({ color: colors.textSecondary });
    }

    return baseStyle as StyleProp<TextStyle>;
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
