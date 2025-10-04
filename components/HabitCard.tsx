import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HabitWithCompletion } from '../store/habitStore';
import { getThemeColors, useTheme } from '../utils/theme';

/**
 * Props for the HabitCard component.
 */
interface HabitCardProps {
  habit: HabitWithCompletion;
  onToggle: (habitId: number) => void;
  onPress?: (habit: HabitWithCompletion) => void;
}

/**
 * A card component that displays a habit with its completion status and toggle functionality.
 * Shows the habit's icon, name, completion status, and provides a toggle button.
 * Supports long press for edit functionality and displays count progress for count goals.
 * Supports both light and dark themes.
 */
export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onPress,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const handleToggle = () => {
    onToggle(habit.id);
  };

  const handlePress = () => {
    onPress?.(habit);
  };

  const handleLongPress = () => {
    // Long press now shows details instead of edit
    if (onPress) {
      onPress(habit);
    }
  };

  const renderToggleButton = () => {
    if (habit.goal_type === 'count') {
      const currentCount = habit.currentCount || 0;
      const targetCount = habit.targetCount || 1;
      const isCompleted = currentCount >= targetCount;

      return (
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isCompleted && { backgroundColor: '#fcba03' },
            currentCount > 0 &&
              !isCompleted && { backgroundColor: colors.primary },
          ]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              { color: colors.text },
              isCompleted && { color: '#fff' },
              currentCount > 0 && !isCompleted && { color: '#fff' },
            ]}
          >
            {isCompleted
              ? '✓'
              : currentCount > 0
                ? currentCount.toString()
                : '○'}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          habit.isCompletedToday && { backgroundColor: '#fcba03' },
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.toggleText,
            { color: colors.text },
            habit.isCompletedToday && { color: '#fff' },
          ]}
        >
          {habit.isCompletedToday ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.shadow },
        (habit.goal_type === 'count'
          ? (habit.currentCount || 0) >= (habit.targetCount || 1)
          : habit.isCompletedToday) && {
          backgroundColor: '#fcba03',
          borderColor: '#fcba03',
          borderWidth: 1,
        },
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{habit.custom_emoji || habit.icon}</Text>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.name,
                { color: colors.text },
                (habit.goal_type === 'count'
                  ? (habit.currentCount || 0) >= (habit.targetCount || 1)
                  : habit.isCompletedToday) && styles.completedText,
              ]}
            >
              {habit.name}
            </Text>
            <Text style={[styles.streak, { color: colors.text }]}>
              {habit.streak > 0
                ? `${habit.streak} day${habit.streak !== 1 ? 's' : ''} streak`
                : 'Start your streak today!'}
              {habit.goal_type === 'count' && (
                <Text style={[styles.countInline, { color: colors.text }]}>
                  {' • '}
                  {habit.currentCount || 0}/{habit.targetCount || 1}
                </Text>
              )}
            </Text>
            {onPress && (
              <Text style={[styles.editHint, { color: colors.text }]}>
                Tap to view details
              </Text>
            )}
          </View>
        </View>

        {renderToggleButton()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedCard: {
    backgroundColor: '#fef4d6',
    borderColor: '#fcba03',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#1a1a1a', // Keep dark color for completed habits on yellow background
  },
  streak: {
    fontSize: 14,
    marginBottom: 2, // Add small margin to control spacing
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    minWidth: 48, // Ensure minimum touch target
    minHeight: 48,
  },
  toggleButtonCompleted: {
    backgroundColor: '#fcba03',
    borderColor: '#fcba03',
  },
  toggleButtonPartial: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  toggleText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  toggleTextCompleted: {
    color: '#fff',
  },
  toggleTextPartial: {
    color: '#fff',
    fontSize: 16,
  },
  countInline: {
    fontSize: 14,
    fontWeight: '600',
  },
  editHint: {
    fontSize: 10,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
