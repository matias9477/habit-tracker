import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
  earliestHabitDate?: Date | null;
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
  earliestHabitDate,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  console.log('[DateHeader] Rendered:', { date });

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

  const showNavigationInfo = () => {
    let message = 'Navigation limits:\n';

    if (earliestHabitDate) {
      message += `• Earliest: ${earliestHabitDate.toLocaleDateString()}\n`;
    } else {
      message += '• Earliest: Today (no habits yet)\n';
    }

    const today = new Date();
    const maxFuture = new Date(today);
    maxFuture.setDate(maxFuture.getDate() + 2);
    message += `• Latest: ${maxFuture.toLocaleDateString()}`;

    Alert.alert('Navigation Info', message, [{ text: 'OK' }]);
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
            <TouchableOpacity
              style={styles.infoButton}
              onPress={showNavigationInfo}
              activeOpacity={0.7}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
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
  infoButton: {
    marginLeft: 8,
  },
});
