import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { useHabitStore } from '../store/habitStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { getThemeColors } from '../utils/theme';
import { exportHabitData } from '../utils/dataExport';
import {
  configureNotifications,
  sendTestNotification,
  areNotificationsEnabled,
  cancelAllNotifications,
} from '../utils/notifications';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import TermsOfServiceModal from '../components/TermsOfServiceModal';

/**
 * Settings screen component that allows users to configure app preferences.
 * Includes notification settings, data management, and app information.
 */
export const SettingsScreen: React.FC = () => {
  const {
    isDarkMode,
    notificationsEnabled,
    toggleDarkMode,
    toggleNotifications,
  } = useThemeStore();
  const { habits, deleteHabit } = useHabitStore();
  const { resetOnboarding } = useOnboardingStore();
  const colors = getThemeColors(isDarkMode);

  const [isNotificationsConfigured, setIsNotificationsConfigured] =
    useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const enabled = await areNotificationsEnabled();
      setIsNotificationsConfigured(enabled);
    };

    checkNotificationStatus();
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Enable notifications
      const success = await configureNotifications();
      if (success) {
        toggleNotifications();
        setIsNotificationsConfigured(true);
        Alert.alert(
          'Success',
          'Notifications enabled! You can now receive reminders.'
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive reminders.'
        );
      }
    } else {
      // Disable notifications
      await cancelAllNotifications();
      toggleNotifications();
      setIsNotificationsConfigured(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        'Test Sent',
        'Check your notification panel for a test notification!'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send test notification. Please check your notification permissions.'
      );
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  const handleExportData = async () => {
    const success = await exportHabitData(habits);
    if (success) {
      Alert.alert('Success', 'Data exported successfully!');
    } else {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your habits and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all habits
              for (const habit of habits) {
                await deleteHabit(habit.id);
              }
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screen again on the next app launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Success', 'Onboarding will show on next app launch.');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    iconName: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={iconName as any} size={24} color={colors.primary} />
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text
            style={[styles.settingSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {rightComponent && (
        <View style={styles.settingRight}>{rightComponent}</View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          {renderSettingItem(
            'Daily Reminders',
            notificationsEnabled
              ? 'Notifications are enabled'
              : 'Get notified about your habits',
            'notifications-outline',
            undefined,
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          )}
          {notificationsEnabled &&
            renderSettingItem(
              'Test Notification',
              'Send a test notification',
              'send-outline',
              handleTestNotification
            )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          {renderSettingItem(
            'Dark Mode',
            'Switch to dark theme',
            'moon-outline',
            undefined,
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data
          </Text>
          {renderSettingItem(
            'Export Data',
            'Download your habit data as CSV',
            'download-outline',
            handleExportData
          )}
          {renderSettingItem(
            'Clear All Data',
            'Delete all habits and progress',
            'trash-outline',
            handleClearData
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          {renderSettingItem('Version', '1.0.0', 'information-circle-outline')}
          {renderSettingItem(
            'Privacy Policy',
            'Read our privacy policy',
            'shield-outline',
            () => setShowPrivacyPolicy(true)
          )}
          {renderSettingItem(
            'Terms of Service',
            'Read our terms of service',
            'document-text-outline',
            () => setShowTermsOfService(true)
          )}
          {renderSettingItem(
            'Reset Onboarding',
            'Show onboarding again on next launch',
            'refresh-outline',
            handleResetOnboarding
          )}
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    marginLeft: 12,
  },
});
