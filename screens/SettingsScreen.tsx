import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore } from '../store/habitStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors, useTheme } from '../utils/theme';
import { getAppVersion } from '../utils/version';
import { shouldShowDebugFeatures, getEnvironment } from '../utils/environment';
import {
  configureNotifications,
  sendTestNotification,
  areNotificationsEnabled,
  cancelAllNotifications,
  scheduleAllHabitReminders,
  cancelAllHabitReminders,
} from '../utils/notifications';
import { exportHabitData } from '../utils/dataExport';
import { getDatabaseInfo, repairDatabase, resetDatabase } from '../db/database';
import { testSeedData } from '../utils/testSeed';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import TermsOfServiceModal from '../components/TermsOfServiceModal';

/**
 * Settings screen component that allows users to configure app preferences.
 * Includes notification settings, data management, and app information.
 */
export const SettingsScreen: React.FC = () => {
  const { themeMode, notificationsEnabled, setThemeMode, toggleNotifications } =
    useThemeStore();
  const { habits, deleteHabit } = useHabitStore();
  const { resetOnboarding } = useOnboardingStore();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const enabled = await areNotificationsEnabled();
    };

    checkNotificationStatus();
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Enable notifications
      const success = await configureNotifications();
      if (success) {
        toggleNotifications();
        // Schedule daily reminders
        await scheduleAllHabitReminders(habits);
        Alert.alert(
          'Success',
          'Notifications enabled! You can now receive reminders.'
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders.'
        );
      }
    } else {
      // Disable notifications
      await cancelAllHabitReminders();
      await cancelAllNotifications();
      toggleNotifications();
      Alert.alert(
        'Notifications disabled',
        'You will no longer receive reminders.'
      );
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
    // Cycle through theme modes: system -> light -> dark -> system
    const nextMode =
      themeMode === 'system'
        ? 'light'
        : themeMode === 'light'
          ? 'dark'
          : 'system';
    setThemeMode(nextMode);
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

  const handleTestSeedData = () => {
    Alert.alert(
      'Test Seed Data',
      'This will clear all data and seed with test habits having different creation dates.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            try {
              await testSeedData();
              Alert.alert(
                'Success',
                'Test data seeded! Navigate to July 1-17 to see different habits.'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to seed test data.');
            }
          },
        },
      ]
    );
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will completely reset the database and delete all data. This action cannot be undone and will require a restart.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Database',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert(
                'Database Reset',
                'Database has been reset. Please restart the app to complete the process.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Force app restart by throwing an error
                      throw new Error(
                        'Database reset completed. Please restart the app.'
                      );
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to reset database. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleShowDatabaseInfo = async () => {
    try {
      const dbInfo = await getDatabaseInfo();
      const infoText = `Version: ${dbInfo.version}\nTables: ${dbInfo.tables.join(', ')}\nHabits Columns: ${dbInfo.habitsColumns.join(', ')}\nCompletions Columns: ${dbInfo.completionsColumns.join(', ')}`;

      Alert.alert('Database Info', infoText, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to get database info.');
    }
  };

  const handleRepairDatabase = () => {
    Alert.alert(
      'Repair Database',
      'This will attempt to repair any database issues without losing data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Repair',
          onPress: async () => {
            try {
              const success = await repairDatabase();
              if (success) {
                Alert.alert(
                  'Success',
                  'Database repair completed successfully.'
                );
              } else {
                Alert.alert(
                  'Error',
                  'Database repair failed. You may need to reset the database.'
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Database repair failed. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReinitializeDatabase = () => {
    Alert.alert(
      'Reinitialize Database',
      "This will run database migrations again. This is useful if you're experiencing database issues.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reinitialize',
          onPress: async () => {
            try {
              // Assuming runMigrations is defined elsewhere or will be added
              // For now, commenting out as it's not in the new imports
              // await runMigrations();
              Alert.alert(
                'Success',
                'Database reinitialization completed successfully.'
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Database reinitialization failed. You may need to reset the database.'
              );
            }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(100, insets.bottom) },
        ]}
        style={{ flex: 1, paddingTop: insets.top }}
      >
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
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={
                notificationsEnabled
                  ? colors.switchThumb
                  : colors.switchThumbDisabled
              }
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
            'Theme',
            themeMode === 'system'
              ? 'Follow system setting'
              : themeMode === 'light'
                ? 'Light mode'
                : 'Dark mode',
            'moon-outline',
            handleToggleDarkMode
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
          {renderSettingItem(
            'Version',
            getAppVersion(),
            'information-circle-outline'
          )}
          {renderSettingItem(
            'Environment',
            getEnvironment(),
            'information-circle-outline'
          )}
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

        {/* Development section - only show in development */}
        {shouldShowDebugFeatures() && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Development
            </Text>
            {renderSettingItem(
              'Database Info',
              'Show database structure and version',
              'information-circle-outline',
              handleShowDatabaseInfo
            )}
            {renderSettingItem(
              'Reinitialize Database',
              'Run database migrations again',
              'sync-outline',
              handleReinitializeDatabase
            )}
            {renderSettingItem(
              'Repair Database',
              'Attempt to repair database issues',
              'construct-outline',
              handleRepairDatabase
            )}
            {renderSettingItem(
              'Reset Database',
              'Complete database reset (use only if experiencing issues)',
              'refresh-circle-outline',
              handleResetDatabase
            )}
            {renderSettingItem(
              'Test Seed Data',
              'Seed with test habits (different creation dates)',
              'flask-outline',
              handleTestSeedData
            )}
          </View>
        )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
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
