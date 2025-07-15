import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  message: string;
}

/**
 * Check if we're running in Expo Go (which has notification limitations).
 */
const isExpoGo = () => {
  return Constants.appOwnership === 'expo';
};

/**
 * Configure notification behavior for the app.
 * Sets up how notifications are displayed and handled.
 */
export const configureNotifications = async () => {
  // Allow notifications in Expo Go but log a warning
  if (isExpoGo()) {
    console.log('Notifications enabled in Expo Go (may have limitations)');
  }

  try {
    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    return true;
  } catch (error) {
    console.log('Notification setup failed:', error);
    return false;
  }
};

/**
 * Send a test notification immediately.
 * @returns Promise<string> - Notification identifier
 */
export const sendTestNotification = async (): Promise<string> => {
  if (isExpoGo()) {
    console.log('Test notification enabled in Expo Go');
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Consistency',
        body: 'This is a test notification from Consistency!',
        data: { type: 'test' },
      },
      trigger: null, // Send immediately
    });

    return identifier;
  } catch (error) {
    console.log('Test notification failed:', error);
    return '';
  }
};

/**
 * Get all scheduled notifications.
 * @returns Promise<Notifications.NotificationRequest[]> - Array of scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  if (isExpoGo()) {
    console.log('Get scheduled notifications enabled in Expo Go');
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Get scheduled notifications failed:', error);
    return [];
  }
};

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllNotifications = async () => {
  if (isExpoGo()) {
    console.log('Cancel notifications enabled in Expo Go');
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Cancel notifications failed:', error);
  }
};

/**
 * Check if notifications are enabled.
 * @returns Promise<boolean> - Whether notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  if (isExpoGo()) {
    console.log('Check notifications enabled in Expo Go');
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Check notifications enabled failed:', error);
    return false;
  }
};
