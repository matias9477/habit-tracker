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
  console.log('[HabitCard] Rendered:', { habit });

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

  const renderCountProgress = () => {
    if (habit.goal_type !== 'count') return null;

    const currentCount = habit.currentCount || 0;
    const targetCount = habit.targetCount || 1;
    const progress = Math.min(currentCount / targetCount, 1);
    const progressWidth = progress * 100; // Convert to number

    return (
      <View style={styles.countContainer}>
        <View style={styles.countTextContainer}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {currentCount}/{targetCount}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressWidth}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      </View>
    );
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
            isCompleted && { backgroundColor: colors.success },
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
          habit.isCompletedToday && { backgroundColor: colors.success },
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
          backgroundColor: colors.primaryLight + '20',
          borderColor: colors.success,
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
            <Text style={[styles.streak, { color: colors.textSecondary }]}>
              {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
            </Text>
            {habit.goal_type === 'count' && (
              <Text style={[styles.goalType, { color: colors.textSecondary }]}>
                Count Goal
              </Text>
            )}
            {onPress && (
              <Text style={[styles.editHint, { color: colors.textSecondary }]}>
                Tap to view details
              </Text>
            )}
          </View>
        </View>

        {renderToggleButton()}
      </View>

      {renderCountProgress()}
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
    backgroundColor: '#f0f8ff',
    borderColor: '#4CAF50',
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
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  streak: {
    fontSize: 14,
    color: '#666',
  },
  goalType: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 2,
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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
  countContainer: {
    marginTop: 12,
  },
  countTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  editHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
