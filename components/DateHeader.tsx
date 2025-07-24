import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, useTheme } from '@/utils/theme';

/**
 * Props for the DateHeader component.
 */
interface DateHeaderProps {
  date: Date;
  onDateChange: (direction: 'prev' | 'next') => void;
  onTodayPress: () => void;
}

/**
 * A minimal header component that displays the current date with subtle navigation controls.
 * Shows the date in a clean format with minimal navigation arrows.
 * Supports both light and dark themes.
 */
export const DateHeader: React.FC<DateHeaderProps> = ({
  date,
  onDateChange,
  onTodayPress,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const formatDayOfWeek = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
    };
    return date.toLocaleDateString('en-US', options).toUpperCase();
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = () => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatRelativeDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.border }]}
          onPress={() => onDateChange('prev')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={onTodayPress}
          activeOpacity={0.7}
        >
          <View style={styles.dateContainer}>
            <Text style={[styles.dayOfWeek, { color: colors.textSecondary }]}>
              {formatDayOfWeek(date)}
            </Text>
            <Text style={[styles.dayNumber, { color: colors.text }]}>
              {formatDayNumber(date)}
            </Text>
          </View>
          <Text
            style={[
              styles.relativeDate,
              { color: colors.textSecondary },
              isToday() && { color: colors.primary },
            ]}
          >
            {formatRelativeDate(date)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.border }]}
          onPress={() => onDateChange('next')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  relativeDate: {
    fontSize: 12,
    fontWeight: '500',
  },
});
