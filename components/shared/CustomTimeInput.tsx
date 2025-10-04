import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, useTheme } from '../../utils/theme';

interface CustomTimeInputProps {
  value: string; // Format: "HH:MM"
  onValueChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Custom time input component that allows users to enter time in HH:MM format.
 * Includes validation and formatting.
 */
export const CustomTimeInput: React.FC<CustomTimeInputProps> = ({
  value,
  onValueChange,
  label = 'Time',
  placeholder = '09:00',
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  const validateAndFormatTime = (input: string): string | null => {
    // Remove any non-digit characters
    const cleanInput = input.replace(/\D/g, '');

    if (cleanInput.length === 0) return null;
    if (cleanInput.length === 1) return `0${cleanInput}:`;
    if (cleanInput.length === 2) return `${cleanInput}:`;
    if (cleanInput.length === 3)
      return `${cleanInput.slice(0, 2)}:${cleanInput.slice(2)}`;
    if (cleanInput.length === 4) {
      const hours = parseInt(cleanInput.slice(0, 2));
      const minutes = parseInt(cleanInput.slice(2, 4));

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${cleanInput.slice(0, 2)}:${cleanInput.slice(2, 4)}`;
      }
    }

    return null;
  };

  const handleTimeChange = (text: string) => {
    const formatted = validateAndFormatTime(text);
    if (formatted !== null) {
      setInputValue(formatted);
    }
  };

  const handleSave = () => {
    const formatted = validateAndFormatTime(inputValue);
    if (formatted && formatted.length === 5) {
      onValueChange(formatted);
      setIsEditing(false);
    } else {
      Alert.alert(
        'Invalid Time',
        'Please enter a valid time in HH:MM format (e.g., 09:00)'
      );
    }
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  const openEditor = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}

        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.timeInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={inputValue}
            onChangeText={handleTimeChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={5}
            autoFocus
            selectTextOnFocus
          />

          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: colors.error || '#F44336' },
              ]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.timeButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={openEditor}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.timeText, { color: colors.text }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
