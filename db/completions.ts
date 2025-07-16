import { getDatabase } from './database';

/**
 * Type representing a habit completion row in the database.
 */
export type HabitCompletion = {
  id: number;
  habit_id: number;
  date: string; // ISO string (YYYY-MM-DD)
  count?: number; // For count-based habits
};

/**
 * Marks a habit as completed for a given date (default: today).
 */
export const markHabitCompleted = async (
  habitId: number,
  date: string = new Date().toISOString().slice(0, 10)
): Promise<number | null> => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT OR IGNORE INTO habit_completions (habit_id, date) VALUES (?, ?)',
      [habitId, date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Mark habit completed error', error);
    return null;
  }
};

/**
 * Unmarks a habit as completed for a given date (default: today).
 */
export const unmarkHabitCompleted = async (
  habitId: number,
  date: string = new Date().toISOString().slice(0, 10)
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );
    return true;
  } catch (error) {
    console.error('Unmark habit completed error', error);
    return false;
  }
};

/**
 * Increments the count for a count-based habit for a given date.
 */
export const incrementHabitCount = async (
  habitId: number,
  date: string = new Date().toISOString().slice(0, 10)
): Promise<number> => {
  try {
    const db = await getDatabase();

    // Check if there's already a completion record for today
    const existing = await db.getFirstAsync<HabitCompletion>(
      'SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );

    if (existing) {
      // Update existing record
      const newCount = (existing.count || 0) + 1;
      await db.runAsync(
        'UPDATE habit_completions SET count = ? WHERE habit_id = ? AND date = ?',
        [newCount, habitId, date]
      );
      return newCount;
    } else {
      // Create new record
      const result = await db.runAsync(
        'INSERT INTO habit_completions (habit_id, date, count) VALUES (?, ?, 1)',
        [habitId, date]
      );
      return 1;
    }
  } catch (error) {
    console.error('Increment habit count error', error);
    return 0;
  }
};

/**
 * Decrements the count for a count-based habit for a given date.
 */
export const decrementHabitCount = async (
  habitId: number,
  date: string = new Date().toISOString().slice(0, 10)
): Promise<number> => {
  try {
    const db = await getDatabase();

    // Get current count
    const existing = await db.getFirstAsync<HabitCompletion>(
      'SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );

    if (existing && existing.count && existing.count > 0) {
      const newCount = existing.count - 1;

      if (newCount === 0) {
        // Remove the record if count reaches 0
        await db.runAsync(
          'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?',
          [habitId, date]
        );
        return 0;
      } else {
        // Update the count
        await db.runAsync(
          'UPDATE habit_completions SET count = ? WHERE habit_id = ? AND date = ?',
          [newCount, habitId, date]
        );
        return newCount;
      }
    }

    return 0;
  } catch (error) {
    console.error('Decrement habit count error', error);
    return 0;
  }
};

/**
 * Gets the current count for a habit on a given date.
 */
export const getHabitCountForDate = async (
  habitId: number,
  date: string = new Date().toISOString().slice(0, 10)
): Promise<number> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<HabitCompletion>(
      'SELECT count FROM habit_completions WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Get habit count error', error);
    return 0;
  }
};

/**
 * Fetches all completions for a given date.
 */
export const getCompletionsForDate = async (
  date: string
): Promise<HabitCompletion[]> => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<HabitCompletion>(
      'SELECT * FROM habit_completions WHERE date = ?',
      [date]
    );
  } catch (error) {
    console.error('Get completions for date error', error);
    return [];
  }
};

/**
 * Gets the current streak for a habit (number of consecutive days up to today).
 */
export const getStreakForHabit = async (habitId: number): Promise<number> => {
  // This logic assumes completions are not missing for the streak period
  const today = new Date();
  let streak = 0;
  for (let i = 0; ; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    // eslint-disable-next-line no-await-in-loop
    const completions = await getCompletionsForDate(dateStr);
    if (completions.some(c => c.habit_id === habitId)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Gets the total number of completions for a habit across all time.
 */
export const getTotalCompletionsForHabit = async (
  habitId: number
): Promise<number> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT SUM(count) as total FROM habit_completions WHERE habit_id = ?',
      [habitId]
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Get total completions error', error);
    return 0;
  }
};
