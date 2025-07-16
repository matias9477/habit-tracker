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
import { getThemeColors, useTheme } from '@/utils/theme';
import { GoalTypeSelector } from '@/components/shared/GoalTypeSelector';
import { CategorySelector } from '@/components/shared/CategorySelector';
import { CustomEmojiInput } from '@/components/shared/CustomEmojiInput';
import { ThemedInput } from '@/components/shared/ThemedInput';
import { ThemedButton } from '@/components/shared/ThemedButton';
import { HabitWithCompletion } from '@/store/habitStore';
import { getCategoryById } from '@/utils/categories';

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
    targetCount?: number
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('EditHabitModal useEffect - habit:', habit);
    if (habit) {
      console.log('Populating form with habit data:', {
        name: habit.name,
        category: habit.category,
        goal_type: habit.goal_type,
        targetCount: habit.targetCount,
        custom_emoji: habit.custom_emoji,
      });
      setName(habit.name);
      setSelectedCategory(habit.category || 'fitness');
      setGoalType(habit.goal_type);
      setTargetCount(habit.targetCount?.toString() || '1');
      setCustomEmoji(habit.custom_emoji || '');
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

      console.log('EditHabitModal submitting:', {
        id: habit.id,
        name: name.trim(),
        category: selectedCategory,
        goalType,
        customEmoji: customEmoji || undefined,
        targetCount: finalTargetCount,
      });

      const success = await onUpdate(
        habit.id,
        name.trim(),
        selectedCategory,
        goalType,
        customEmoji || undefined,
        finalTargetCount
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
});
