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
    return false;
  }
};

/**
 * Send a test notification immediately.
 * @returns Promise<string> - Notification identifier
 */
export const sendTestNotification = async (): Promise<string> => {
  if (isExpoGo()) {
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
    return '';
  }
};

/**
 * Schedule a daily reminder notification for a habit.
 * @param habitName - Name of the habit
 * @param time - Time in HH:MM format (e.g., "09:00")
 * @returns Promise<string> - Notification identifier
 */
export const scheduleHabitReminder = async (
  habitName: string,
  time: string
): Promise<string> => {
  if (isExpoGo()) {
  }

  try {
    const [hour, minute] = time.split(':').map(Number);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Consistency Reminder',
        body: `Time to work on your habit: ${habitName}`,
        data: { type: 'habit_reminder', habitName },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });

    return identifier;
  } catch (error) {
    return '';
  }
};

/**
 * Cancel a specific notification by identifier.
 * @param identifier - Notification identifier to cancel
 */
export const cancelNotification = async (identifier: string): Promise<void> => {
  if (isExpoGo()) {
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {}
};

/**
 * Get all scheduled notifications.
 * @returns Promise<Notifications.NotificationRequest[]> - Array of scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  if (isExpoGo()) {
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    return [];
  }
};

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllNotifications = async () => {
  if (isExpoGo()) {
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {}
};

/**
 * Check if notifications are enabled.
 * @returns Promise<boolean> - Whether notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  if (isExpoGo()) {
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
};
