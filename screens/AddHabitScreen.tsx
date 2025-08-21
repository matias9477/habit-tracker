import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../utils/theme';
import { GoalTypeSelector } from '../components/shared/GoalTypeSelector';
import { ThemedInput } from '../components/shared/ThemedInput';
import { ThemedButton } from '../components/shared/ThemedButton';
import { useHabitStore } from '../store/habitStore';

/**
 * A screen component for adding new habits.
 * Provides a form with name input, icon selection (including custom emoji), and goal type selection.
 * Supports both light and dark themes.
 */
export const AddHabitScreen: React.FC = () => {
  console.log('[AddHabitScreen] Rendered');
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { addHabit } = useHabitStore();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏃‍♂️');
  const [goalType, setGoalType] = useState('binary');
  const [targetCount, setTargetCount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const [useCustomEmoji, setUseCustomEmoji] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);

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

      const success = await addHabit(
        name.trim(),
        finalIcon,
        goalType,
        finalTargetCount,
        undefined, // customEmoji
        undefined // targetTimeMinutes
      );
      if (success) {
        // Reset form
        setName('');
        setSelectedIcon('🏃‍♂️');
        setGoalType('binary');
        setTargetCount('1');
        setCustomEmoji('');
        setUseCustomEmoji(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomEmojiPress = () => {
    setShowEmojiModal(true);
  };

  const handleEmojiModalClose = () => {
    setShowEmojiModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => {
              /* Navigate back */
            }}
            style={[styles.backButton, { backgroundColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Add New Habit
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              {icons.slice(0, 6).map(icon => (
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
              {icons.slice(6, 12).map(icon => (
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
                <Text style={styles.iconText}>
                  {useCustomEmoji ? customEmoji : '➕'}
                </Text>
              </TouchableOpacity>
            </View>
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

      {/* Emoji Selection Modal */}
      <Modal
        visible={showEmojiModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={handleEmojiModalClose}
      >
        <View
          style={[
            styles.emojiModalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.emojiModalHeader,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.emojiModalTitle, { color: colors.text }]}>
              Choose Custom Emoji
            </Text>
            <TouchableOpacity
              onPress={handleEmojiModalClose}
              style={[
                styles.emojiModalCloseButton,
                { backgroundColor: colors.border },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.emojiModalContent}>
            <Text style={[styles.emojiModalLabel, { color: colors.text }]}>
              Type your custom emoji:
            </Text>
            <TextInput
              style={[
                styles.emojiModalInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="🎯"
              maxLength={2}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => {
                // Handle emoji input
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
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
  iconText: {
    fontSize: 24,
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
  // Emoji Modal Styles
  emojiModalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emojiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emojiModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emojiModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiModalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiModalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  emojiModalInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    width: 120,
    height: 60,
  },
});
