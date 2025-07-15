import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../utils/theme';

interface GoalType {
  key: string;
  label: string;
  description: string;
}

interface GoalTypeSelectorProps {
  goalType: string;
  onGoalTypeChange: (goalType: string) => void;
}

/**
 * Shared component for selecting goal types (Daily Goal vs Count Goal).
 * Used in both Add and Edit habit modals to ensure consistency.
 */
export const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({
  goalType,
  onGoalTypeChange,
}) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);

  const goalTypes: GoalType[] = [
    {
      key: 'binary',
      label: 'Daily Goal',
      description: 'Complete or not complete',
    },
    {
      key: 'count',
      label: 'Count Goal',
      description: 'Track number of times',
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Goal Type
      </Text>
      {goalTypes.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.goalTypeButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            goalType === type.key && { backgroundColor: colors.primary },
          ]}
          onPress={() => onGoalTypeChange(type.key)}
        >
          <View style={styles.goalTypeContent}>
            <Text
              style={[
                styles.goalTypeLabel,
                { color: colors.text },
                goalType === type.key && { color: '#fff' },
              ]}
            >
              {type.label}
            </Text>
            <Text
              style={[
                styles.goalTypeDescription,
                { color: colors.textSecondary },
                goalType === type.key && { color: '#fff' },
              ]}
            >
              {type.description}
            </Text>
          </View>
          {goalType === type.key && (
            <Text style={[styles.checkmark, { color: '#fff' }]}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  goalTypeButton: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalTypeDescription: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
