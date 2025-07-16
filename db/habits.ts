import { getDatabase } from './database';

/**
 * Type representing a habit row in the database.
 */
export type Habit = {
  id: number;
  name: string;
  icon: string;
  category: string;
  custom_emoji?: string;
  goal_type: string;
  target_count?: number;
  created_at: string;
  // Cached analytics fields for better performance
  total_completions?: number;
  current_streak?: number;
  longest_streak?: number;
  last_completed_date?: string;
};

/**
 * Inserts a new habit into the database.
 */
export const insertHabit = async (
  name: string,
  icon: string,
  category: string = 'general',
  goalType: string = 'binary',
  customEmoji?: string,
  targetCount?: number
): Promise<number | null> => {
  try {
    const db = await getDatabase();
    const createdAt = new Date().toISOString();
    const finalTargetCount = targetCount || (goalType === 'count' ? 1 : null);

    const result = await db.runAsync(
      'INSERT INTO habits (name, icon, category, custom_emoji, goal_type, target_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        icon,
        category,
        customEmoji || null,
        goalType,
        finalTargetCount,
        createdAt,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Insert habit error', error);
    return null;
  }
};

/**
 * Inserts a new habit into the database with a custom creation date.
 * Used for seeding data with specific dates.
 */
export const insertHabitWithDate = async (
  name: string,
  icon: string,
  createdAt: Date,
  category: string = 'general',
  goalType: string = 'binary',
  customEmoji?: string,
  targetCount?: number
): Promise<number | null> => {
  try {
    const db = await getDatabase();
    const createdAtString = createdAt.toISOString();
    const finalTargetCount = targetCount || (goalType === 'count' ? 1 : null);

    const result = await db.runAsync(
      'INSERT INTO habits (name, icon, category, custom_emoji, goal_type, target_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        icon,
        category,
        customEmoji || null,
        goalType,
        finalTargetCount,
        createdAtString,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Insert habit with date error', error);
    return null;
  }
};

/**
 * Updates an existing habit by id.
 */
export const updateHabit = async (
  id: number,
  name: string,
  icon: string,
  category: string,
  goalType: string,
  customEmoji?: string,
  targetCount?: number
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const finalTargetCount = targetCount || (goalType === 'count' ? 1 : null);

    await db.runAsync(
      'UPDATE habits SET name = ?, icon = ?, category = ?, custom_emoji = ?, goal_type = ?, target_count = ? WHERE id = ?',
      [
        name,
        icon,
        category,
        customEmoji || null,
        goalType,
        finalTargetCount,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error('Update habit error', error);
    return false;
  }
};

/**
 * Updates only the analytics fields for a habit by id.
 */
export const updateHabitAnalyticsFields = async (
  id: number,
  totalCompletions: number,
  currentStreak: number,
  longestStreak: number,
  lastCompletedDate: string | null
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE habits SET total_completions = ?, current_streak = ?, longest_streak = ?, last_completed_date = ? WHERE id = ?',
      [totalCompletions, currentStreak, longestStreak, lastCompletedDate, id]
    );
    return true;
  } catch (error) {
    console.error('Update habit analytics fields error', error);
    return false;
  }
};

/**
 * Deletes a habit by id.
 */
export const deleteHabit = async (id: number): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Delete habit error', error);
    return false;
  }
};

/**
 * Fetches all habits from the database.
 */
export const getAllHabits = async (): Promise<Habit[]> => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<Habit>(
      'SELECT * FROM habits ORDER BY created_at DESC'
    );
  } catch (error) {
    console.error('Get all habits error', error);
    return [];
  }
};

/**
 * Fetches habits that were created on or before a specific date.
 * This prevents new habits from appearing on past dates.
 */
export const getHabitsForDate = async (date: Date): Promise<Habit[]> => {
  try {
    const db = await getDatabase();
    const dateString = date.toISOString().slice(0, 10); // YYYY-MM-DD format

    const habits = await db.getAllAsync<Habit>(
      'SELECT * FROM habits WHERE DATE(created_at) <= ? ORDER BY created_at DESC',
      [dateString]
    );

    return habits;
  } catch (error) {
    console.error('Get habits for date error', error);
    return [];
  }
};

/**
 * Gets the earliest habit creation date.
 * Used to limit navigation to not go further back than the first habit.
 */
export const getEarliestHabitDate = async (): Promise<Date | null> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ created_at: string }>(
      'SELECT created_at FROM habits ORDER BY created_at ASC LIMIT 1'
    );

    if (result) {
      return new Date(result.created_at);
    }
    return null;
  } catch (error) {
    console.error('Get earliest habit date error', error);
    return null;
  }
};
