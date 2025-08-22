import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, useTheme } from '../utils/theme';

/**
 * Props for the DateHeader component.
 */
interface DateHeaderProps {
  date: Date;
  onDateChange: (direction: 'prev' | 'next') => void;
  onTodayPress: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
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
  canGoBack,
  canGoForward,
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

  const formatRelativeDate = (date: Date): string => {
    const today = new Date();

    // Reset time to start of day for accurate comparison
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const diffTime = dateStart.getTime() - todayStart.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < -1 && diffDays >= -7) {
      return `${Math.abs(diffDays)} days ago`;
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
          style={[
            styles.navButton,
            {
              backgroundColor: canGoBack ? colors.border : colors.textTertiary,
              opacity: canGoBack ? 1 : 0.5,
            },
          ]}
          onPress={() => canGoBack && onDateChange('prev')}
          activeOpacity={canGoBack ? 0.7 : 1}
          disabled={!canGoBack}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={canGoBack ? colors.textSecondary : colors.textTertiary}
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
          <Text style={[styles.relativeDate, { color: colors.textSecondary }]}>
            {formatRelativeDate(date)}
          </Text>
          {/* Show navigation limit message */}
          {!canGoBack && (
            <Text style={[styles.limitMessage, { color: colors.textTertiary }]}>
              {/* Earliest date message removed - user doesn't find it useful */}
            </Text>
          )}
          {!canGoForward && (
            <Text style={[styles.limitMessage, { color: colors.textTertiary }]}>
              {/* Latest date message removed - user doesn't find it useful */}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: canGoForward
                ? colors.border
                : colors.textTertiary,
              opacity: canGoForward ? 1 : 0.5,
            },
          ]}
          onPress={() => canGoForward && onDateChange('next')}
          activeOpacity={canGoForward ? 0.7 : 1}
          disabled={!canGoForward}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={canGoForward ? colors.textSecondary : colors.textTertiary}
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
    height: 60, // Fixed height to prevent container size changes
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
    height: 20, // Fixed height to prevent container size changes
    textAlign: 'center', // Center the text
    lineHeight: 20, // Match the height to center text vertically
    includeFontPadding: false, // Remove extra font padding on Android
  },
  limitMessage: {
    fontSize: 10,
    marginTop: 4,
  },
});
