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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { GoalTypeSelector } from './shared/GoalTypeSelector';
import { CategorySelector } from './shared/CategorySelector';
import { CustomEmojiInput } from './shared/CustomEmojiInput';
import { ThemedInput } from './shared/ThemedInput';
import { ThemedButton } from './shared/ThemedButton';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * Props for the AddHabitModal component.
 */
interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    category: string,
    goalType: string,
    targetCount?: number,
    customEmoji?: string,
    reminderEnabled?: boolean,
    reminderTime?: string
  ) => Promise<boolean>;
}

/**
 * A modal component for adding new habits.
 * Provides a form with name input, category selection, custom emoji input, and goal type selection.
 * Supports both light and dark themes.
 */
export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  console.log('[AddHabitModal] Rendered:', { visible });

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [goalType, setGoalType] = useState('binary');
  const [targetCount, setTargetCount] = useState('1');
  const [customEmoji, setCustomEmoji] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug useEffect
  useEffect(() => {
    console.log('[AddHabitModal] showTimePicker changed to:', showTimePicker);
  }, [showTimePicker]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTargetCount =
        goalType === 'count' ? parseInt(targetCount) : undefined;

      const success = await onAdd(
        name.trim(),
        selectedCategory,
        goalType,
        finalTargetCount,
        customEmoji || undefined,
        reminderEnabled,
        reminderTime
      );
      if (success) {
        handleClose();
      }
    } catch {
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedCategory('fitness');
    setGoalType('binary');
    setTargetCount('1');
    setCustomEmoji('');
    setReminderEnabled(false);
    setReminderTime('09:00');
    onClose();
  };

  const handleCustomEmojiChange = (emoji: string) => {
    setCustomEmoji(emoji);
  };

  const handleCustomEmojiClear = () => {
    setCustomEmoji('');
  };

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
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Add New Habit
            </Text>
            <View style={{ width: 32 }} />
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
                autoFocus
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Daily Reminder
              </Text>
              <View
                style={[
                  styles.reminderToggle,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.reminderLabel, { color: colors.text }]}>
                  Get reminded daily
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
                      console.log('[AddHabitModal] Time picker button pressed');
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

            {/* Debug Section - Remove in production */}
            {__DEV__ && (
              <View style={styles.debugSection}>
                <Text
                  style={[styles.debugText, { color: colors.textSecondary }]}
                >
                  Debug: reminderEnabled={reminderEnabled.toString()},
                  reminderTime={reminderTime}, showTimePicker=
                  {showTimePicker.toString()}
                </Text>
              </View>
            )}

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

          {/* Submit Button */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(20, insets.bottom),
              },
            ]}
          >
            <ThemedButton
              title={isSubmitting ? 'Adding...' : 'Add Habit'}
              onPress={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              loading={isSubmitting}
            />
          </View>
        </KeyboardAvoidingView>

        {/* Time Picker Overlay - This was working! */}
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
                    console.log('[AddHabitModal] Creating picker date with:', {
                      hours,
                      minutes,
                      date,
                    });
                  }
                  return date;
                })()}
                mode="time"
                display="spinner"
                textColor={isDarkMode ? '#ffffff' : '#000000'}
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    console.log('[AddHabitModal] Raw date from picker:', date);
                    console.log('[AddHabitModal] Date hours:', date.getHours());
                    console.log(
                      '[AddHabitModal] Date minutes:',
                      date.getMinutes()
                    );

                    // Use the picker's time directly without timezone conversion
                    const hours = date.getHours();
                    const minutes = date.getMinutes();

                    // Ensure hours are in 24-hour format for consistency
                    const newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    console.log(
                      '[AddHabitModal] Raw hours from picker:',
                      hours
                    );
                    console.log(
                      '[AddHabitModal] Raw minutes from picker:',
                      minutes
                    );
                    console.log('[AddHabitModal] Calculated newTime:', newTime);
                    console.log(
                      '[AddHabitModal] Setting reminderTime to:',
                      newTime
                    );
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fcba03',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customEmojiSection: {
    marginBottom: 12,
  },
  customEmojiToggle: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
  },
  customEmojiToggleActive: {
    backgroundColor: '#fef4d6',
    borderColor: '#fcba03',
    borderWidth: 1,
  },
  customEmojiToggleText: {
    fontSize: 14,
    color: '#666',
  },
  customEmojiToggleTextActive: {
    color: '#fcba03',
    fontWeight: '600',
  },
  customEmojiInputContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  customEmojiInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    width: 80,
    height: 40,
  },
  customEmojiPreviewContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  customEmojiLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  customEmojiPreview: {
    fontSize: 32,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedIconButton: {
    borderColor: '#fcba03',
    backgroundColor: '#fef4d6',
  },
  iconText: {
    fontSize: 24,
  },
  goalTypeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedGoalTypeButton: {
    borderColor: '#fcba03',
    backgroundColor: '#fef4d6',
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedGoalTypeLabel: {
    color: '#fcba03',
  },
  goalTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedGoalTypeDescription: {
    color: '#fcba03',
  },
  checkmark: {
    fontSize: 18,
    color: '#fcba03',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  debugSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  debugText: {
    fontSize: 12,
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
