import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { HabitWithCompletion } from "../store/habitStore";

/**
 * Props for the HabitCard component.
 */
interface HabitCardProps {
  habit: HabitWithCompletion;
  onToggle: (habitId: number) => void;
  onEdit?: (habit: HabitWithCompletion) => void;
  onPress?: (habit: HabitWithCompletion) => void;
}

/**
 * A card component that displays a habit with its completion status and toggle functionality.
 * Shows the habit's icon, name, completion status, and provides a toggle button.
 * Supports long press for edit functionality and displays count progress for count goals.
 */
export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onEdit,
  onPress,
}) => {
  const handleToggle = () => {
    onToggle(habit.id);
  };

  const handlePress = () => {
    onPress?.(habit);
  };

  const handleLongPress = () => {
    if (onEdit) {
      // Add haptic feedback for better UX
      // You can add expo-haptics later if needed
      onEdit(habit);
    }
  };

  const renderCountProgress = () => {
    if (habit.goal_type !== "count") return null;

    const currentCount = habit.currentCount || 0;
    const targetCount = habit.targetCount || 1;
    const progress = Math.min(currentCount / targetCount, 1);
    const progressWidth = progress * 100; // Convert to number

    return (
      <View style={styles.countContainer}>
        <View style={styles.countTextContainer}>
          <Text style={styles.countText}>
            {currentCount}/{targetCount}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
        </View>
      </View>
    );
  };

  const renderToggleButton = () => {
    if (habit.goal_type === "count") {
      const currentCount = habit.currentCount || 0;
      const targetCount = habit.targetCount || 1;
      const isCompleted = currentCount >= targetCount;

      return (
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isCompleted && styles.toggleButtonCompleted,
            currentCount > 0 && !isCompleted && styles.toggleButtonPartial,
          ]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              isCompleted && styles.toggleTextCompleted,
              currentCount > 0 && !isCompleted && styles.toggleTextPartial,
            ]}
          >
            {isCompleted
              ? "✓"
              : currentCount > 0
              ? currentCount.toString()
              : "○"}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.toggleButton,
          habit.isCompletedToday && styles.toggleButtonCompleted,
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.toggleText,
            habit.isCompletedToday && styles.toggleTextCompleted,
          ]}
        >
          {habit.isCompletedToday ? "✓" : "○"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, habit.isCompletedToday && styles.completedCard]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{habit.icon}</Text>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.name,
                habit.isCompletedToday && styles.completedText,
              ]}
            >
              {habit.name}
            </Text>
            <Text style={styles.streak}>
              {habit.streak} day{habit.streak !== 1 ? "s" : ""} streak
            </Text>
            {habit.goal_type === "count" && (
              <Text style={styles.goalType}>Count Goal</Text>
            )}
            {onEdit && <Text style={styles.editHint}>Long press to edit</Text>}
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedCard: {
    backgroundColor: "#f0f8ff",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  streak: {
    fontSize: 14,
    color: "#666",
  },
  goalType: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    marginTop: 2,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  toggleButtonCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  toggleButtonPartial: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  toggleText: {
    fontSize: 20,
    color: "#999",
    fontWeight: "bold",
  },
  toggleTextCompleted: {
    color: "#fff",
  },
  toggleTextPartial: {
    color: "#fff",
    fontSize: 16,
  },
  countContainer: {
    marginTop: 12,
  },
  countTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  countText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  editHint: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
});
