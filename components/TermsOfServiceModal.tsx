import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../utils/theme';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Terms of Service Modal Component
 *
 * Displays the app's terms of service in a modal with proper theming
 * and scrollable content for easy reading.
 */
const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Terms of Service
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close terms of service"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acceptance of Terms
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            By downloading, installing, or using the Consistency app, you agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description of Service
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Consistency is a mobile application designed to help users track and
            build positive habits. The app allows users to create, manage, and
            monitor their daily habits and goals.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            User Responsibilities
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            You are responsible for maintaining the confidentiality of your
            device and ensuring that no unauthorized person has access to your
            device. You agree to accept responsibility for all activities that
            occur under your device.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data and Privacy
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Your data is stored locally on your device. We do not collect,
            store, or transmit your personal data to external servers. Please
            refer to our Privacy Policy for more details about data handling.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Updates and Maintenance
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            We may update the app from time to time to improve functionality,
            fix bugs, or add new features. Updates may be automatic or require
            your consent, depending on your device settings.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Limitation of Liability
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            The app is provided "as is" without warranties of any kind. We are
            not liable for any damages arising from the use or inability to use
            the app, including but not limited to data loss or device issues.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Termination
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            You may stop using the app at any time. We may terminate or suspend
            access to the app immediately, without prior notice, for any reason,
            including breach of these Terms of Service.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Changes to Terms
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            We reserve the right to modify these terms at any time. We will
            notify users of significant changes through app updates or in-app
            notifications. Continued use of the app after changes constitutes
            acceptance of the new terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Governing Law
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            These terms are governed by the laws of the jurisdiction where the
            app is developed and distributed. Any disputes shall be resolved in
            the appropriate courts of that jurisdiction.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            If you have any questions about these Terms of Service, please
            contact us through the app store or our support channels.
          </Text>

          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TermsOfServiceModal;
