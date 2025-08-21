import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

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
    // Notifications are limited in Expo Go; skip configuration
    return false;
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
    // Log error for debugging
    console.error('Error configuring notifications:', error);
    return false;
  }
};

/**
 * Send a test notification immediately.
 * @returns Promise<string> - Notification identifier
 */
export const sendTestNotification = async (): Promise<string> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return '';
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
    console.error('Error sending test notification:', error);
    return '';
  }
};

/**
 * Schedule a daily reminder for a specific habit.
 * @param habitId - The habit ID
 * @param habitName - The habit name
 * @param reminderTime - Time in HH:MM format (e.g., "09:00")
 * @returns Promise<string> - Notification identifier
 */
export const scheduleHabitReminder = async (
  habitId: number,
  habitName: string,
  reminderTime: string
): Promise<string> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return '';
  }

  try {
    const [hour, minute] = reminderTime.split(':').map(Number);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Reminder',
        body: `Time to work on: ${habitName}`,
        data: {
          type: 'habit_reminder',
          habitId,
          habitName,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: hour ?? 9,
        minute: minute ?? 0,
      },
    });

    console.log(
      `[Notifications] Habit reminder scheduled for ${habitName} at ${reminderTime} with ID: ${identifier}`
    );
    return identifier;
  } catch (error) {
    console.error('Error scheduling habit reminder:', error);
    return '';
  }
};

/**
 * Cancel a specific habit's reminder.
 * @param habitId - The habit ID to cancel reminders for
 */
export const cancelHabitReminder = async (habitId: number): Promise<void> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return;
  }

  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    // Cancel notifications for this specific habit
    for (const notification of scheduledNotifications) {
      if (
        notification.content.data?.type === 'habit_reminder' &&
        notification.content.data?.habitId === habitId
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
        console.log(`[Notifications] Cancelled reminder for habit ${habitId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling habit reminder:', error);
  }
};

/**
 * Schedule reminders for all habits that have them enabled.
 * @param habits - Array of habits with reminder settings
 */
export const scheduleAllHabitReminders = async (
  habits: any[]
): Promise<void> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return;
  }

  try {
    // First cancel all existing habit reminders
    await cancelAllHabitReminders();

    // Schedule new reminders for habits that have them enabled
    for (const habit of habits) {
      if (habit.reminder_enabled && habit.reminder_time) {
        await scheduleHabitReminder(habit.id, habit.name, habit.reminder_time);
      }
    }

    console.log(
      `[Notifications] Scheduled reminders for ${habits.filter(h => h.reminder_enabled).length} habits`
    );
  } catch (error) {
    console.error('Error scheduling all habit reminders:', error);
  }
};

/**
 * Cancel all habit reminders.
 */
export const cancelAllHabitReminders = async (): Promise<void> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return;
  }

  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    // Cancel all habit reminders
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === 'habit_reminder') {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
        console.log(
          `[Notifications] Cancelled habit reminder: ${notification.identifier}`
        );
      }
    }
  } catch (error) {
    console.error('Error cancelling all habit reminders:', error);
  }
};

/**
 * Cancel a specific notification by identifier.
 * @param identifier - Notification identifier to cancel
 */
export const cancelNotification = async (identifier: string): Promise<void> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error cancelling notification:', error);
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
    // Notifications are not supported in Expo Go
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllNotifications = async () => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Check if notifications are enabled.
 * @returns Promise<boolean> - Whether notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  if (isExpoGo()) {
    // Notifications are not supported in Expo Go
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
};
