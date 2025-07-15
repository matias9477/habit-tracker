import React, { useState } from 'react';
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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../utils/theme';
import { GoalTypeSelector } from './shared/GoalTypeSelector';
import { ThemedInput } from './shared/ThemedInput';
import { ThemedButton } from './shared/ThemedButton';

/**
 * Props for the AddHabitModal component.
 */
interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    icon: string,
    goalType: string,
    targetCount?: number
  ) => Promise<boolean>;
}

/**
 * A modal component for adding new habits.
 * Provides a form with name input, icon selection (including custom emoji), and goal type selection.
 * Supports both light and dark themes.
 */
export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏃‍♂️');
  const [goalType, setGoalType] = useState('binary');
  const [targetCount, setTargetCount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const [useCustomEmoji, setUseCustomEmoji] = useState(false);

  const icons = [
    '🏃‍♂️', // Exercise
    '💪', // Strength
    '🧠', // Learning
    '📚', // Reading
    '💧', // Hydration
    '🥗', // Healthy eating
    '😴', // Sleep
    '🧘‍♀️', // Meditation
    '🎯', // Focus
    '⭐', // Achievement
    '🔥', // Motivation
    '💎', // Consistency
  ];

  const goalTypes = [
    {
      key: 'binary',
      label: 'Daily Goal',
      description: 'Complete or not complete',
    },
    { key: 'count', label: 'Count Goal', description: 'Track number of times' },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (useCustomEmoji && !customEmoji.trim()) {
      Alert.alert('Error', 'Please enter a custom emoji');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalIcon = useCustomEmoji ? customEmoji : selectedIcon;
      const finalTargetCount =
        goalType === 'count' ? parseInt(targetCount) : undefined;

      const success = await onAdd(
        name.trim(),
        finalIcon,
        goalType,
        finalTargetCount
      );
      if (success) {
        handleClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon('🏃‍♂️');
    setGoalType('binary');
    setTargetCount('1');
    setCustomEmoji('');
    setUseCustomEmoji(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleCustomEmojiPress = () => {
    console.log('Custom emoji button pressed');
    setUseCustomEmoji(!useCustomEmoji);
    if (!useCustomEmoji) {
      setCustomEmoji('');
    }
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
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Add New Habit
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
                autoFocus
                maxLength={50}
              />
            </View>

            {/* Icon Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Choose an Icon
              </Text>

              <View style={styles.iconGrid}>
                {icons.slice(0, 6).map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      selectedIcon === icon &&
                        !useCustomEmoji && {
                          backgroundColor: colors.primary,
                        },
                    ]}
                    onPress={() => {
                      setSelectedIcon(icon);
                      setUseCustomEmoji(false);
                    }}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.iconGrid}>
                {icons.slice(6, 12).map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      selectedIcon === icon &&
                        !useCustomEmoji && {
                          backgroundColor: colors.primary,
                        },
                    ]}
                    onPress={() => {
                      setSelectedIcon(icon);
                      setUseCustomEmoji(false);
                    }}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
                {/* Custom Emoji Button */}
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    useCustomEmoji && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={handleCustomEmojiPress}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={useCustomEmoji ? '#fff' : colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {useCustomEmoji && (
                <View style={styles.customEmojiInputContainer}>
                  <TextInput
                    style={[
                      styles.customEmojiInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={customEmoji}
                    onChangeText={setCustomEmoji}
                    maxLength={2}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    placeholder=""
                  />
                </View>
              )}
            </View>

            {/* Goal Type Selection */}
            <GoalTypeSelector
              goalType={goalType}
              onGoalTypeChange={setGoalType}
            />

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
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  customEmojiToggleText: {
    fontSize: 14,
    color: '#666',
  },
  customEmojiToggleTextActive: {
    color: '#4CAF50',
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
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
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
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
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
    color: '#4CAF50',
  },
  goalTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedGoalTypeDescription: {
    color: '#4CAF50',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
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
});
