import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { getThemeColors } from '@/utils/theme';

/**
 * Props for the DateHeader component.
 */
interface DateHeaderProps {
  date?: Date;
}

/**
 * A header component that displays the current date in a formatted way.
 * Shows the day of the week, month, and day number.
 * Supports both light and dark themes.
 */
export const DateHeader: React.FC<DateHeaderProps> = ({
  date = new Date(),
}) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDayOfWeek = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
    };
    return date.toLocaleDateString('en-US', options).toUpperCase();
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.dateContainer}>
        <Text style={[styles.dayOfWeek, { color: colors.textSecondary }]}>
          {formatDayOfWeek(date)}
        </Text>
        <Text style={[styles.dayNumber, { color: colors.text }]}>
          {formatDayNumber(date)}
        </Text>
      </View>
      <Text style={[styles.fullDate, { color: colors.textSecondary }]}>
        {formatDate(date)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayOfWeek: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullDate: {
    fontSize: 14,
  },
});
