import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors, useTheme } from '../utils/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoalTypeSelector } from '../components/shared/GoalTypeSelector';
import { CategorySelector } from '../components/shared/CategorySelector';
import { CustomEmojiInput } from '../components/shared/CustomEmojiInput';
import { ThemedInput } from '../components/shared/ThemedInput';
import { ThemedButton } from '../components/shared/ThemedButton';
import { HabitWithCompletion } from '../store/habitStore';

/**
 * Props for the EditHabitModal component.
 */
interface EditHabitModalProps {
  visible: boolean;
  habit: HabitWithCompletion | null;
  onClose: () => void;
  onUpdate: (
    id: number,
    name: string,
    category: string,
    goalType: string,
    customEmoji?: string,
    targetCount?: number,
    reminderEnabled?: boolean,
    reminderTime?: string
  ) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

/**
 * A modal component for editing existing habits.
 * Provides a form with name input, category selection, custom emoji input, and goal type selection.
 * Supports both light and dark themes.
 */
export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  visible,
  habit,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [goalType, setGoalType] = useState('binary');
  const [targetCount, setTargetCount] = useState('1');
  const [customEmoji, setCustomEmoji] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedCategory(habit.category || 'fitness');
      setGoalType(habit.goal_type);
      setTargetCount(habit.targetCount?.toString() || '1');
      setCustomEmoji(habit.custom_emoji || '');
      setReminderEnabled(habit.reminder_enabled || false);
      setReminderTime(habit.reminder_time || '09:00');
    }
  }, [habit]);

  // Reset form when modal becomes invisible
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!habit) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTargetCount =
        goalType === 'count' ? parseInt(targetCount) : undefined;

      const success = await onUpdate(
        habit.id,
        name.trim(),
        selectedCategory,
        goalType,
        customEmoji || undefined,
        finalTargetCount,
        reminderEnabled,
        reminderTime
      );
      if (success) {
        handleClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!habit) return;

    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const success = await onDelete(habit.id);
              if (success) {
                handleClose();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setSelectedCategory('fitness');
    setGoalType('binary');
    setTargetCount('1');
    setCustomEmoji('');
    setReminderEnabled(false);
    setReminderTime('09:00');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCustomEmojiChange = (emoji: string) => {
    setCustomEmoji(emoji);
  };

  const handleCustomEmojiClear = () => {
    setCustomEmoji('');
  };

  if (!habit) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Edit Habit
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Habit Name Input */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Habit Name
              </Text>
              <ThemedInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Exercise, Read, Drink Water"
                maxLength={50}
              />
            </View>

            {/* Category Selection */}
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Custom Emoji Input */}
            <CustomEmojiInput
              value={customEmoji}
              onEmojiChange={handleCustomEmojiChange}
              onClear={handleCustomEmojiClear}
            />

            {/* Goal Type Selection */}
            <GoalTypeSelector
              goalType={goalType}
              onGoalTypeChange={setGoalType}
            />

            {/* Reminder Settings */}
            <View style={styles.section}>
              <View style={styles.reminderTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Daily Reminder
                </Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: reminderEnabled
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => setReminderEnabled(!reminderEnabled)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [{ translateX: reminderEnabled ? 22 : 0 }],
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {reminderEnabled && (
                <View style={styles.timeInputContainer}>
                  <Text style={[styles.timeInputLabel, { color: colors.text }]}>
                    Reminder time
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.timePickerButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setShowTimePicker(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.timePickerText, { color: colors.text }]}
                    >
                      {reminderTime}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Target Count for Count Goals */}
            {goalType === 'count' && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Target Count
                </Text>
                <ThemedInput
                  value={targetCount}
                  onChangeText={setTargetCount}
                  placeholder="How many times?"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(20, insets.bottom),
              },
            ]}
          >
            <View style={styles.buttonContainer}>
              <ThemedButton
                title="Delete"
                onPress={handleDelete}
                disabled={isSubmitting}
                variant="danger"
                style={styles.deleteButton}
              />
              <ThemedButton
                title={isSubmitting ? 'Updating...' : 'Update Habit'}
                onPress={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                loading={isSubmitting}
                style={styles.updateButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Time Picker Overlay */}
        {showTimePicker && (
          <View style={styles.timePickerOverlay}>
            <View
              style={[
                styles.timePickerContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.timePickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.timePickerCancelButton}
                >
                  <Text
                    style={[
                      styles.timePickerButtonText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.timePickerTitle, { color: colors.text }]}>
                  Set Reminder Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.timePickerDoneButton}
                >
                  <Text
                    style={[
                      styles.timePickerButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={(() => {
                  // Create a date object with the current reminder time, avoiding timezone issues
                  const [hours, minutes] = reminderTime.split(':').map(Number);
                  const date = new Date();
                  if (hours !== undefined && minutes !== undefined) {
                    date.setHours(hours, minutes, 0, 0);
                  }
                  return date;
                })()}
                mode="time"
                display="spinner"
                textColor={isDarkMode ? '#ffffff' : '#000000'}
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    // Use the picker's time directly without timezone conversion
                    const hours = date.getHours();
                    const minutes = date.getMinutes();

                    // Ensure hours are in 24-hour format for consistency
                    const newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    setReminderTime(newTime);
                  }
                }}
                style={styles.timePicker}
              />
            </View>
          </View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  updateButton: {
    flex: 2,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleButton: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    position: 'relative',
  },
  toggleThumb: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 2,
    top: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  timeInputContainer: {
    marginTop: 12,
  },
  timeInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  timePickerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContent: {
    width: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timePickerDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timePickerButtonText: {
    fontSize: 16,
  },
  timePicker: {
    width: '100%',
  },
});
