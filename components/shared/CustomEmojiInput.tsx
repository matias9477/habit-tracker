import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { getThemeColors, useTheme } from '@/utils/theme';

interface CustomEmojiInputProps {
  value?: string;
  onEmojiChange: (emoji: string) => void;
  onClear: () => void;
}

/**
 * A compact component for inputting custom emojis for habit categories.
 * Only shows when the user wants to add a custom emoji.
 */
export const CustomEmojiInput: React.FC<CustomEmojiInputProps> = ({
  value,
  onEmojiChange,
  onClear,
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isExpanded, setIsExpanded] = useState(!!value);
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  // Update inputValue when value prop changes
  useEffect(() => {
    console.log('CustomEmojiInput value changed:', value);
    setInputValue(value || '');
    setIsExpanded(!!value);
  }, [value]);

  const handleSave = () => {
    const trimmedValue = inputValue.trim();
    console.log('CustomEmojiInput handleSave - trimmedValue:', trimmedValue);

    // Validate emoji input - allow flags (which can be 2-4 characters)
    if (trimmedValue && trimmedValue.length > 4) {
      Alert.alert(
        'Invalid Emoji',
        'Please enter a valid emoji (max 4 characters for flags).',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('CustomEmojiInput calling onEmojiChange with:', trimmedValue);
    onEmojiChange(trimmedValue);
    if (!trimmedValue) {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onClear();
    setIsExpanded(false);
  };

  const handleToggle = () => {
    if (isExpanded) {
      handleClear();
    } else {
      setIsExpanded(true);
    }
  };

  if (!isExpanded && !value) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
            + Add Custom Emoji
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Custom Emoji</Text>
        <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
          <Text style={[styles.closeText, { color: colors.textSecondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter emoji (e.g., 🏃‍♂️)"
          placeholderTextColor={colors.textSecondary}
          maxLength={4}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Save
            </Text>
          </TouchableOpacity>

          {value && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: colors.surface }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {value && (
        <View
          style={[styles.previewContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
            Current: {value}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 12,
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 14,
  },
});
