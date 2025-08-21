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
  target_time_minutes?: number;
  reminder_enabled: boolean;
  reminder_time?: string; // Format: "HH:MM"
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  targetCount?: number,
  targetTimeMinutes?: number,
  reminderEnabled: boolean = false,
  reminderTime?: string
): Promise<number | null> => {
  try {
    const db = await getDatabase();

    // Use local date instead of UTC to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const now = `${year}-${month}-${day}`;

    const finalTargetCount = targetCount || (goalType === 'count' ? 1 : null);

    const result = await db.runAsync(
      'INSERT INTO habits (name, icon, category, custom_emoji, goal_type, target_count, target_time_minutes, reminder_enabled, reminder_time, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        icon,
        category,
        customEmoji || null,
        goalType,
        finalTargetCount,
        targetTimeMinutes || null,
        reminderEnabled ? 1 : 0,
        reminderTime || null,
        1, // is_active = true
        now,
        now,
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
  targetCount?: number,
  targetTimeMinutes?: number
): Promise<number | null> => {
  try {
    const db = await getDatabase();

    // Convert to local date string instead of UTC to avoid timezone issues
    const year = createdAt.getFullYear();
    const month = String(createdAt.getMonth() + 1).padStart(2, '0');
    const day = String(createdAt.getDate()).padStart(2, '0');
    const createdAtString = `${year}-${month}-${day}`;

    const finalTargetCount = targetCount || (goalType === 'count' ? 1 : null);

    const result = await db.runAsync(
      'INSERT INTO habits (name, icon, category, custom_emoji, goal_type, target_count, target_time_minutes, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        icon,
        category,
        customEmoji || null,
        goalType,
        finalTargetCount,
        targetTimeMinutes || null,
        1, // is_active = true
        createdAtString,
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
  targetCount?: number,
  targetTimeMinutes?: number,
  reminderEnabled?: boolean,
  reminderTime?: string
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const finalTargetCount = targetCount || (goalType === 'count' ? 1 : null);

    // Use local date instead of UTC to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const now = `${year}-${month}-${day}`;

    await db.runAsync(
      'UPDATE habits SET name = ?, icon = ?, category = ?, custom_emoji = ?, goal_type = ?, target_count = ?, target_time_minutes = ?, reminder_enabled = ?, reminder_time = ?, updated_at = ? WHERE id = ?',
      [
        name,
        icon,
        category,
        customEmoji || null,
        goalType,
        finalTargetCount,
        targetTimeMinutes || null,
        reminderEnabled ? 1 : 0,
        reminderTime || null,
        now,
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
 * Soft deletes a habit by setting is_active to false.
 * This preserves the habit's history while marking it as inactive.
 */
export const softDeleteHabit = async (id: number): Promise<boolean> => {
  try {
    const db = await getDatabase();

    // Use local date instead of UTC to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const now = `${year}-${month}-${day}`;

    await db.runAsync(
      'UPDATE habits SET is_active = 0, updated_at = ? WHERE id = ?',
      [now, id]
    );
    return true;
  } catch (error) {
    console.error('Soft delete habit error', error);
    return false;
  }
};

/**
 * Reactivates a previously soft-deleted habit.
 */
export const reactivateHabit = async (id: number): Promise<boolean> => {
  try {
    const db = await getDatabase();

    // Use local date instead of UTC to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const now = `${year}-${month}-${day}`;

    await db.runAsync(
      'UPDATE habits SET is_active = 1, updated_at = ? WHERE id = ?',
      [now, id]
    );
    return true;
  } catch (error) {
    console.error('Reactivate habit error', error);
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
 * Fetches all active habits from the database.
 */
export const getAllHabits = async (): Promise<Habit[]> => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<Habit>(
      'SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC'
    );
  } catch (error) {
    console.error('Get all habits error', error);
    return [];
  }
};

/**
 * Fetches all habits (including inactive ones) from the database.
 * Useful for admin purposes or data export.
 */
export const getAllHabitsIncludingInactive = async (): Promise<Habit[]> => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<Habit>(
      'SELECT * FROM habits ORDER BY created_at DESC'
    );
  } catch (error) {
    console.error('Get all habits including inactive error', error);
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

    // Use local date instead of UTC to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const habits = await db.getAllAsync<Habit>(
      'SELECT * FROM habits WHERE DATE(created_at) <= ? AND is_active = 1 ORDER BY created_at DESC',
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
