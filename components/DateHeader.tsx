import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * Props for the DateHeader component.
 */
interface DateHeaderProps {
  date?: Date;
}

/**
 * A header component that displays the current date in a formatted way.
 * Shows the day of the week, month, and day number.
 */
export const DateHeader: React.FC<DateHeaderProps> = ({
  date = new Date(),
}) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDayOfWeek = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
    };
    return date.toLocaleDateString("en-US", options).toUpperCase();
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.dayOfWeek}>{formatDayOfWeek(date)}</Text>
        <Text style={styles.dayNumber}>{formatDayNumber(date)}</Text>
      </View>
      <Text style={styles.fullDate}>{formatDate(date)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dayOfWeek: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
    marginRight: 8,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#495057",
  },
  fullDate: {
    fontSize: 14,
    color: "#6c757d",
  },
});
