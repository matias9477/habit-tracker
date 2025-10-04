import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { getThemeColors, useTheme } from '../../utils/theme';

interface ThemedInputProps extends TextInputProps {
  placeholder?: string;
}

/**
 * Shared themed input component that automatically adapts to light/dark mode.
 * Used across all forms to ensure consistent styling and theming.
 */
export const ThemedInput: React.FC<ThemedInputProps> = props => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.surface,
          color: colors.text,
          borderColor: colors.border,
        },
      ]}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
});
