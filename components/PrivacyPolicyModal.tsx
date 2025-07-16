import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { getThemeColors } from '@/utils/theme';

/**
 * Props for the PrivacyPolicyModal component.
 */
interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Privacy policy modal that explains how the app handles user data.
 * Required for app store approval when the app handles user data.
 */
export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Privacy Policy
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.border }]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Collection
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              Consistency collects and stores your habit data locally on your
              device. This includes habit names, completion status, and
              statistics. No personal data is transmitted to external servers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Storage
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              All your habit data is stored locally on your device using SQLite
              database. This ensures your data remains private and under your
              control. Data is automatically backed up with your device's backup
              system.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Export
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              You can export your habit data at any time through the Settings
              screen. This creates a JSON file that you can save or share. The
              export feature only works when you manually initiate it.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notifications
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              If you enable notifications, the app will send local reminders for
              your habits. These notifications are processed locally on your
              device and do not require internet connectivity.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Third-Party Services
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              Habit Tracker does not use any third-party analytics, advertising,
              or tracking services. The app operates completely offline and does
              not collect or share any personal information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Deletion
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              You can delete your data at any time by deleting the app from your
              device. All habit data will be permanently removed when the app is
              uninstalled.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Contact
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              If you have any questions about this privacy policy, please
              contact us through the app store review system or your device's
              app support.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.acceptButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
