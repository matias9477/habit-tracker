import { getDatabase } from "./database";

/**
 * Type representing a habit row in the database.
 */
export type Habit = {
  id: number;
  name: string;
  icon: string;
  goal_type: string;
  target_count?: number;
  created_at: string;
};

/**
 * Inserts a new habit into the database.
 */
export const insertHabit = async (
  name: string,
  icon: string,
  goalType: string = "binary",
  targetCount?: number
): Promise<number | null> => {
  try {
    const db = await getDatabase();
    const createdAt = new Date().toISOString();
    const finalTargetCount = targetCount || (goalType === "count" ? 1 : null);

    const result = await db.runAsync(
      "INSERT INTO habits (name, icon, goal_type, target_count, created_at) VALUES (?, ?, ?, ?, ?)",
      [name, icon, goalType, finalTargetCount, createdAt]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Insert habit error", error);
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
  goalType: string,
  targetCount?: number
): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const finalTargetCount = targetCount || (goalType === "count" ? 1 : null);

    await db.runAsync(
      "UPDATE habits SET name = ?, icon = ?, goal_type = ?, target_count = ? WHERE id = ?",
      [name, icon, goalType, finalTargetCount, id]
    );
    return true;
  } catch (error) {
    console.error("Update habit error", error);
    return false;
  }
};

/**
 * Deletes a habit by id.
 */
export const deleteHabit = async (id: number): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM habits WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Delete habit error", error);
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
      "SELECT * FROM habits ORDER BY created_at DESC"
    );
  } catch (error) {
    console.error("Get all habits error", error);
    return [];
  }
};
