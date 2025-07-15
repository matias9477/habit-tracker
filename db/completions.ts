import { getDatabase } from "./database";

/**
 * Type representing a habit completion row in the database.
 */
export type HabitCompletion = {
  id: number;
  habit_id: number;
  date: string; // ISO string (YYYY-MM-DD)
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
      "INSERT OR IGNORE INTO habit_completions (habit_id, date) VALUES (?, ?)",
      [habitId, date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Mark habit completed error", error);
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
      "DELETE FROM habit_completions WHERE habit_id = ? AND date = ?",
      [habitId, date]
    );
    return true;
  } catch (error) {
    console.error("Unmark habit completed error", error);
    return false;
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
      "SELECT * FROM habit_completions WHERE date = ?",
      [date]
    );
  } catch (error) {
    console.error("Get completions for date error", error);
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
    if (completions.some((c) => c.habit_id === habitId)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};
