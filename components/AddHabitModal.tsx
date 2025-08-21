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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors, useTheme } from '../utils/theme';
import { GoalTypeSelector } from './shared/GoalTypeSelector';
import { CategorySelector } from './shared/CategorySelector';
import { CustomEmojiInput } from './shared/CustomEmojiInput';
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
    category: string,
    goalType: string,
    targetCount?: number,
    customEmoji?: string
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        customEmoji || undefined
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
    setIsSubmitting(false);
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
});
