import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../utils/theme';
import { TimePicker } from './shared/TimePicker';
import {
  scheduleDailyReminders,
  cancelDailyReminders,
} from '../utils/notifications';

interface ReminderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal for configuring daily reminder settings.
 * Allows users to set reminder time and customize the message.
 */
export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const {
    isDarkMode,
    reminderTime,
    reminderMessage,
    setReminderTime,
    setReminderMessage,
  } = useThemeStore();
  const colors = getThemeColors(isDarkMode);

  const [tempTime, setTempTime] = useState(reminderTime);
  const [tempMessage, setTempMessage] = useState(reminderMessage);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!tempTime.trim() || !tempMessage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      // Update the store
      setReminderTime(tempTime);
      setReminderMessage(tempMessage);

      // Schedule the new reminder
      await scheduleDailyReminders(tempTime, tempMessage);

      Alert.alert(
        'Success',
        `Daily reminders scheduled for ${tempTime}\n\n"${tempMessage}"`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      Alert.alert(
        'Error',
        'Failed to save reminder settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setTempTime(reminderTime);
    setTempMessage(reminderMessage);
    onClose();
  };

  const handleTestReminder = async () => {
    try {
      await scheduleDailyReminders(tempTime, tempMessage);
      Alert.alert(
        'Success',
        'Test reminder scheduled! You should receive it shortly.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to schedule test reminder. Please try again.'
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Daily Reminder Settings
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { opacity: isSaving ? 0.6 : 1 }]}
            disabled={isSaving}
          >
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reminder Time
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: colors.textSecondary },
              ]}
            >
              Choose when you want to receive daily reminders
            </Text>
            <TimePicker
              value={tempTime}
              onValueChange={setTempTime}
              label="Daily reminder time"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reminder Message
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: colors.textSecondary },
              ]}
            >
              Customize the message you'll see in your daily reminder
            </Text>
            <TextInput
              style={[
                styles.messageInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={tempMessage}
              onChangeText={setTempMessage}
              placeholder="Enter your reminder message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Preview
            </Text>
            <View
              style={[styles.previewCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                Daily Habit Reminder
              </Text>
              <Text
                style={[styles.previewTime, { color: colors.textSecondary }]}
              >
                {tempTime}
              </Text>
              <Text style={[styles.previewMessage, { color: colors.text }]}>
                "{tempMessage}"
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.primary }]}
              onPress={handleTestReminder}
              activeOpacity={0.8}
            >
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.testButtonText}>Test Reminder</Text>
            </TouchableOpacity>
            <Text
              style={[styles.testDescription, { color: colors.textSecondary }]}
            >
              Send a test reminder to verify your settings
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewMessage: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
